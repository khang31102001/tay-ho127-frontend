"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ManagedArticleCategory } from "../types/article-category.types";
import { deleteArticleCategory, listArticleCategories } from "../services/article-category.service";

export type ArticleCategoryRow = ManagedArticleCategory & { parentName: string };

export function useArticleCategoriesExplorer() {
  const [categories, setCategories] = useState<ManagedArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listArticleCategories();
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const rows = useMemo<ArticleCategoryRow[]>(() => {
    const nameById = new Map(categories.map((category) => [category.id, category.name]));

    return categories.map((category) => ({
      ...category,
      parentName: category.parentId ? nameById.get(category.parentId) ?? "—" : "—",
    }));
  }, [categories]);

  async function handleDelete(category: ManagedArticleCategory) {
    await deleteArticleCategory(category.id);
    await loadCategories();
  }

  return {
    rows,
    isLoading,
    handleDelete,
  };
}
