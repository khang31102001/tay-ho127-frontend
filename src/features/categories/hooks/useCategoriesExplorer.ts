"use client";

import { useMemo } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedCategory } from "../types/category.types";
import { deleteCategory, listCategories } from "../services/category.service";

export type CategoryRow = ManagedCategory & { parentName: string };

export function useCategoriesExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listCategories, [], {
    fallbackError: "Không thể tải danh mục.",
  });

  const rows = useMemo<CategoryRow[]>(() => {
    const categories = data ?? [];
    const nameById = new Map(categories.map((category) => [category.id, category.name]));

    return categories.map((category) => ({
      ...category,
      parentName: category.parentId ? nameById.get(category.parentId) ?? "—" : "—",
    }));
  }, [data]);

  async function handleDelete(category: ManagedCategory) {
    await deleteCategory(category.id);
    await reload();
  }

  return {
    rows,
    isLoading,
    loadError: error,
    handleDelete,
  };
}
