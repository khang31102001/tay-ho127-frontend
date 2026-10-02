"use client";

import { useMemo } from "react";

import { listCategories } from "@/features/categories";
import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedProduct } from "../types/product.types";
import { deleteProduct, listProducts } from "../services/product.service";

export type ProductRow = ManagedProduct & { categoryName: string };

export function useProductsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => Promise.all([listProducts(), listCategories()]),
    [],
    { fallbackError: "Không thể tải sản phẩm." },
  );

  const [products, categories] = data ?? [[], []];

  const rows = useMemo<ProductRow[]>(() => {
    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

    return products.map((product) => ({
      ...product,
      categoryName: categoryNameById.get(product.categoryId) ?? "—",
    }));
  }, [products, categories]);

  async function handleDelete(product: ManagedProduct) {
    await deleteProduct(product.id);
    await reload();
  }

  return {
    rows,
    categories,
    isLoading,
    loadError: error,
    handleDelete,
    reload,
  };
}
