"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedCategory } from "@/features/categories";
import type { ManagedMedia } from "@/features/media";
import type { ManagedModifierGroup } from "@/features/modifier-groups";
import type { ManagedProduct } from "../types/product.types";
import { listCategories } from "@/features/categories";
import { listMedia } from "@/features/media";
import { listModifierGroups } from "@/features/modifier-groups";
import {
  buildProductSchema,
  getSeoSettings,
  isSeoFormEmpty,
  upsertSeoMetadata,
  useSeoMetadataForm,
  useSeoSchemaForm,
  type ManagedSeoSettings,
} from "@/features/seo";
import { getSiteUrl } from "@/lib/site-url";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../services/product.service";

export type ProductFormValue = Omit<ManagedProduct, "id">;

const EMPTY_FORM: ProductFormValue = {
  name: "",
  categoryId: "",
  price: 0,
  description: "",
  status: "active",
  mediaIds: [],
  modifierGroupIds: [],
};

type UseProductEditorParams = {
  id?: string;
};

export function useProductEditor({ id }: UseProductEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ProductFormValue>(EMPTY_FORM);
  const [categoryOptions, setCategoryOptions] = useState<ManagedCategory[]>([]);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [modifierGroupOptions, setModifierGroupOptions] = useState<ManagedModifierGroup[]>([]);
  const [seoSettings, setSeoSettings] = useState<ManagedSeoSettings | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Tab "SEO" — xem ghi chú trong features/seo/hooks/useSeoMetadataForm.ts.
  const seo = useSeoMetadataForm("product", id);
  // Section "Structured Data" trong tab SEO — Product là schema type có ví dụ
  // cụ thể (SKU/Brand) ở Task 7, xem features/seo/hooks/useSeoSchemaForm.ts.
  const schema = useSeoSchemaForm("product", id, "Product");

  useEffect(() => {
    listCategories().then(setCategoryOptions);
    listMedia().then(setMediaOptions);
    listModifierGroups().then(setModifierGroupOptions);
    getSeoSettings().then(setSeoSettings);
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getProductById(id).then((product) => {
      if (isCancelled) {
        return;
      }

      if (product) {
        setForm(product);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof ProductFormValue>(
    field: K,
    value: ProductFormValue[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleMedia(mediaId: string) {
    setForm((previous) => {
      const hasMedia = previous.mediaIds.includes(mediaId);

      return {
        ...previous,
        mediaIds: hasMedia
          ? previous.mediaIds.filter((item) => item !== mediaId)
          : [...previous.mediaIds, mediaId],
      };
    });
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

  const mainMedia = form.mediaIds[0] ? mediaOptions.find((media) => media.id === form.mediaIds[0]) : undefined;

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
    toggleMedia,
    toggleModifierGroup,
    categoryOptions,
    mediaOptions,
    modifierGroupOptions,
    seo,
    seoSettings,
    schema,
    generatedSchemaPreview,
    isLoading: isLoading || (isEditMode && (seo.isLoading || schema.isLoading)),
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
