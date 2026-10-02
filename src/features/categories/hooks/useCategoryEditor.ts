"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAsyncData } from "@/hooks/useAsyncData";
import { listMedia } from "@/features/media";
import {
  getSeoSettings,
  isSeoFormEmpty,
  upsertSeoMetadata,
  useSeoMetadataForm,
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

  const categories = useAsyncData(listCategories, [], { fallbackError: "Không thể tải danh mục cha." });
  const existing = useAsyncData(() => getCategoryById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải danh mục.",
  });

  // Không cho chọn chính nó làm parent (Backend cũng chặn chọn danh mục con của nó).
  const parentOptions = useMemo(
    () => (categories.data ?? []).filter((category) => category.id !== id),
    [categories.data, id],
  );
  const mediaOptionsData = useAsyncData(listMedia, [], { fallbackError: "Không thể tải thư viện media." });
  const seoSettingsData = useAsyncData(getSeoSettings, [], { fallbackError: "Không thể tải cài đặt SEO." });

  // Tab "SEO" — xem ghi chú trong features/seo/hooks/useSeoMetadataForm.ts.
  const seo = useSeoMetadataForm("category", id);

  useEffect(() => {
    if (!existing.data) return;
    const { name, parentId, sortOrder, status } = existing.data;
    setForm({ name, parentId, sortOrder, status });
  }, [existing.data]);

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
    mediaOptions: mediaOptionsData.data ?? [],
    seo,
    seoSettings: seoSettingsData.data ?? null,
    isLoading: existing.isLoading || (isEditMode && seo.isLoading),
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
