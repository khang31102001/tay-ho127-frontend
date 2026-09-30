"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listCategories } from "@/features/categories";
import { listMedia } from "@/features/media";
import { listModifierGroups } from "@/features/modifier-groups";
import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedProduct } from "../types/product.types";
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

  const options = useAsyncData(
    () => Promise.all([listCategories(), listMedia(), listModifierGroups()]),
    [],
    { fallbackError: "Không thể tải danh mục / media / nhóm tùy chọn." },
  );
  const existing = useAsyncData(() => getProductById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải sản phẩm.",
  });

  const [categoryOptions, mediaOptions, modifierGroupOptions] = options.data ?? [[], [], []];

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
    } else {
      await createProduct(form);
    }
  }

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
    isLoading: existing.isLoading,
    loadError: existing.error ?? options.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
