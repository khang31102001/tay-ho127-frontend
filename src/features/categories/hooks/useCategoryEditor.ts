"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAsyncData } from "@/hooks/useAsyncData";

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
    } else {
      await createCategory(form);
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
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
