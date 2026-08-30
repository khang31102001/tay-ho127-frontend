"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedArticleCategory } from "../types/article-category.types";
import {
  createArticleCategory,
  deleteArticleCategory,
  getArticleCategoryById,
  listArticleCategories,
  updateArticleCategory,
} from "../services/article-category.service";

export type ArticleCategoryFormValue = Omit<ManagedArticleCategory, "id">;

const EMPTY_FORM: ArticleCategoryFormValue = {
  name: "",
  slug: "",
  parentId: null,
  sortOrder: 0,
  status: "active",
};

type UseArticleCategoryEditorParams = {
  id?: string;
};

export function useArticleCategoryEditor({ id }: UseArticleCategoryEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ArticleCategoryFormValue>(EMPTY_FORM);
  const [parentOptions, setParentOptions] = useState<ManagedArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listArticleCategories().then((categories) => {
      setParentOptions(categories.filter((category) => category.id !== id));
    });
  }, [id]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getArticleCategoryById(id).then((category) => {
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

  function updateField<K extends keyof ArticleCategoryFormValue>(
    field: K,
    value: ArticleCategoryFormValue[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (isEditMode) {
      await updateArticleCategory(id, form);
    } else {
      await createArticleCategory(form);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteArticleCategory(id);
    }
  }

  function goToExplore() {
    router.push("/admin/content/article-categories");
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
