"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ManagedCategory } from "../types/category.types";
import { deleteCategory, listCategories } from "../services/category.service";

export type CategoryRow = ManagedCategory & { parentName: string };

export function useCategoriesExplorer() {
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listCategories();
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const rows = useMemo<CategoryRow[]>(() => {
    const nameById = new Map(categories.map((category) => [category.id, category.name]));

    return categories.map((category) => ({
      ...category,
      parentName: category.parentId ? nameById.get(category.parentId) ?? "—" : "—",
    }));
  }, [categories]);

  async function handleDelete(category: ManagedCategory) {
    await deleteCategory(category.id);
    await loadCategories();
  }

  return {
    rows,
    isLoading,
    handleDelete,
  };
}
