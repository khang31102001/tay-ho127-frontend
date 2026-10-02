"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";
import {
  getSeoSettings,
  isSeoFormEmpty,
  upsertSeoMetadata,
  useSeoMetadataForm,
  type ManagedSeoSettings,
} from "@/features/seo";

import type { ManagedCategory } from "../types/category.types";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../services/category.service";

export type CategoryFormValue = Omit<ManagedCategory, "id">;

const EMPTY_FORM: CategoryFormValue = {
  name: "",
  parentId: null,
  sortOrder: 0,
  status: "active",
};

type UseCategoryEditorParams = {
  id?: string;
};

export function useCategoryEditor({ id }: UseCategoryEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<CategoryFormValue>(EMPTY_FORM);
  const [parentOptions, setParentOptions] = useState<ManagedCategory[]>([]);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [seoSettings, setSeoSettings] = useState<ManagedSeoSettings | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Tab "SEO" — xem ghi chú trong features/seo/hooks/useSeoMetadataForm.ts.
  const seo = useSeoMetadataForm("category", id);

  useEffect(() => {
    listCategories().then((categories) => {
      // Không cho chọn chính nó làm parent (tránh vòng lặp tự tham chiếu).
      setParentOptions(categories.filter((category) => category.id !== id));
    });
    listMedia().then(setMediaOptions);
    getSeoSettings().then(setSeoSettings);
  }, [id]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getCategoryById(id).then((category) => {
      if (isCancelled) {
        return;
      }

      if (category) {
        setForm(category);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof CategoryFormValue>(
    field: K,
    value: CategoryFormValue[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updateCategory(id, form);
      await seo.save();
    } else {
      const created = await createCategory(form);

      if (!isSeoFormEmpty(seo.form)) {
        await upsertSeoMetadata("category", created.id, seo.form);
      }
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteCategory(id);
    }
  }

  function goToExplore() {
    router.push("/admin/catalog/categories");
  }

  return {
    form,
    updateField,
    parentOptions,
    mediaOptions,
    seo,
    seoSettings,
    isLoading: isLoading || (isEditMode && seo.isLoading),
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
