"use client";

import { useEffect, useState } from "react";
import { useNavigationRouter } from "@/providers/navigation-loading-provider";

import { listCategories } from "@/features/catalog/categories";
import { isLibraryMedia, listMedia, type ManagedMedia } from "@/features/media";
import { listModifierGroups } from "@/features/catalog/modifier-groups";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

import type { ManagedProduct } from "../types/product.types";
import {
  buildProductSchema,
  getSeoSettings,
  isSeoFormEmpty,
  upsertSeoMetadata,
  useSeoMetadataForm,
  useSeoSchemaForm,
  type ManagedSeoSettings,
} from "@/features/seo";
import { getSiteUrl } from "@/core/config/site-url";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../services/product.service";

export type ProductFormValue = Omit<ManagedProduct, "id">;

const EMPTY_FORM: ProductFormValue = {
  name: "",
  slug: "",
  categoryId: "",
  price: 0,
  description: "",
  content: "",
  status: "active",
  mediaIds: [],
  modifierGroupIds: [],
};

type UseProductEditorParams = {
  id?: string;
};

export function useProductEditor({ id }: UseProductEditorParams) {
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ProductFormValue>(EMPTY_FORM);

  const options = useAsyncData(
    () => Promise.all([listCategories(), listMedia(), listModifierGroups()]),
    [],
    { fallbackError: "Không thể tải danh mục / media / nhóm tùy chọn." },
  );
  const existing = useAsyncData(() => getProductById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải sản phẩm.",
  });

  const [categoryOptions, libraryMedia, modifierGroupOptions] = options.data ?? [[], [], []];

  // Media vừa tải lên trong popup chọn ảnh: thêm vào danh sách đang hiển thị mà không phải tải lại thư viện.
  const [uploadedMedia, setUploadedMedia] = useState<ManagedMedia[]>([]);
  const mediaOptions = [
    ...uploadedMedia.filter((media) => !libraryMedia.some((existing) => existing.id === media.id)),
    ...libraryMedia,
  ];

  // Ảnh đại diện là khóa ngoại tới media.media → chỉ chọn được media thật, không chọn ảnh mẫu đóng gói.
  const thumbnailMediaOptions = mediaOptions.filter(isLibraryMedia);

  function addUploadedMedia(media: ManagedMedia[]) {
    setUploadedMedia((previous) => [...media.filter((item) => !previous.some((p) => p.id === item.id)), ...previous]);
  }
  const seoSettingsData = useAsyncData(getSeoSettings, [], { fallbackError: "Không thể tải cài đặt SEO." });

  // Tab "SEO" — xem ghi chú trong features/seo/hooks/useSeoMetadataForm.ts.
  const seo = useSeoMetadataForm("product", id);
  // Section "Structured Data" trong tab SEO — Product là schema type có ví dụ
  // cụ thể (SKU/Brand) ở Task 7, xem features/seo/hooks/useSeoSchemaForm.ts.
  const schema = useSeoSchemaForm("product", id, "Product");

  useEffect(() => {
    if (!existing.data) return;
    // Giữ nguyên cả các field chỉ hiển thị trên Site (giá gốc, nhãn, đánh giá) để lưu lại không làm mất.
    setForm(existing.data);
  }, [existing.data]);

  function updateField<K extends keyof ProductFormValue>(
    field: K,
    value: ProductFormValue[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleModifierGroup(modifierGroupId: string) {
    setForm((previous) => {
      const hasGroup = previous.modifierGroupIds.includes(modifierGroupId);

      return {
        ...previous,
        modifierGroupIds: hasGroup
          ? previous.modifierGroupIds.filter((item) => item !== modifierGroupId)
          : [...previous.modifierGroupIds, modifierGroupId],
      };
    });
  }

  async function handleSave() {
    if (isEditMode) {
      await updateProduct(id, form);
      await seo.save();
      await schema.save();
    } else {
      const created = await createProduct(form);

      if (!isSeoFormEmpty(seo.form)) {
        await upsertSeoMetadata("product", created.id, seo.form);
      }
      // Schema override (SKU/Brand/Advanced JSON-LD) chỉ có ý nghĩa khi đã có
      // URL thật — bỏ qua lúc tạo mới, Admin cấu hình lại sau khi sản phẩm tồn tại.
    }
  }

  // Ảnh chính = ảnh đại diện, chưa chọn thì dùng ảnh đầu của danh sách (giống Site).
  const mainMediaId = form.thumbnailMediaId ?? form.mediaIds[0];
  const mainMedia = mainMediaId ? mediaOptions.find((media) => media.id === mainMediaId) : undefined;

  const generatedSchemaPreview = buildProductSchema({
    name: form.name || "(chưa đặt tên)",
    description: form.description,
    imageUrl: mainMedia?.url,
    price: form.price,
    url: `${getSiteUrl()}/thuc-don/${id ?? "..."}`,
    sku: schema.form.config?.sku,
    brand: schema.form.config?.brand,
  });

  async function handleDelete() {
    if (isEditMode) {
      await deleteProduct(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/products");
  }

  return {
    form,
    updateField,
    toggleModifierGroup,
    categoryOptions,
    mediaOptions,
    thumbnailMediaOptions,
    addUploadedMedia,
    isLoadingOptions: options.isLoading,
    modifierGroupOptions,
    seo,
    seoSettings: seoSettingsData.data ?? null,
    schema,
    generatedSchemaPreview,
    isLoading: existing.isLoading || (isEditMode && (seo.isLoading || schema.isLoading)),
    loadError: existing.error ?? options.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
