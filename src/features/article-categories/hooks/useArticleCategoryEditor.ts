"use client";

import { useEffect, useMemo, useState } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";
import { useNavigationRouter } from "@/provider/navigation-loading-provider";

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
  const router = useNavigationRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<ArticleCategoryFormValue>(EMPTY_FORM);
  const categories = useAsyncData(listArticleCategories, [], { fallbackError: "Không thể tải danh mục cha." });
  const existing = useAsyncData(() => getArticleCategoryById(id ?? ""), [id], {
    enabled: isEditMode,
    fallbackError: "Không thể tải danh mục bài viết.",
  });

  // Không cho chọn chính nó làm parent (Backend cũng chặn chọn danh mục con của nó).
  const parentOptions = useMemo(
    () => (categories.data ?? []).filter((category) => category.id !== id),
    [categories.data, id],
  );

  useEffect(() => {
    if (!existing.data) return;
    const { name, slug, parentId, sortOrder, status } = existing.data;
    setForm({ name, slug, parentId, sortOrder, status });
  }, [existing.data]);

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
    isLoading: existing.isLoading,
    loadError: existing.error,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
