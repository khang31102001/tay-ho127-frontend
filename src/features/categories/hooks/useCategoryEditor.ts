"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listCategories().then((categories) => {
      // Không cho chọn chính nó làm parent (tránh vòng lặp tự tham chiếu).
      setParentOptions(categories.filter((category) => category.id !== id));
    });
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
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
