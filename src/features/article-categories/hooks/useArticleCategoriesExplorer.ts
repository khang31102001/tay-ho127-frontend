"use client";

import { useMemo } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedArticleCategory } from "../types/article-category.types";
import { deleteArticleCategory, listArticleCategories } from "../services/article-category.service";

export type ArticleCategoryRow = ManagedArticleCategory & { parentName: string };

export function useArticleCategoriesExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listArticleCategories, [], {
    fallbackError: "Không thể tải danh mục bài viết.",
  });

  const rows = useMemo<ArticleCategoryRow[]>(() => {
    const categories = data ?? [];
    const nameById = new Map(categories.map((category) => [category.id, category.name]));

    return categories.map((category) => ({
      ...category,
      parentName: category.parentId ? nameById.get(category.parentId) ?? "—" : "—",
    }));
  }, [data]);

  async function handleDelete(category: ManagedArticleCategory) {
    await deleteArticleCategory(category.id);
    await reload();
  }

  return {
    rows,
    isLoading,
    loadError: error,
    handleDelete,
  };
}
