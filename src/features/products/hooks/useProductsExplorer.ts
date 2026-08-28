"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ManagedCategory } from "@/features/categories";
import type { ManagedProduct } from "../types/product.types";
import { listCategories } from "@/features/categories";
import { deleteProduct, listProducts } from "../services/product.service";

export type ProductRow = ManagedProduct & { categoryName: string };

export function useProductsExplorer() {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);

    try {
      const [productData, categoryData] = await Promise.all([listProducts(), listCategories()]);
      setProducts(productData);
      setCategories(categoryData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const rows = useMemo<ProductRow[]>(() => {
    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

    return products.map((product) => ({
      ...product,
      categoryName: categoryNameById.get(product.categoryId) ?? "—",
    }));
  }, [products, categories]);

  async function handleDelete(product: ManagedProduct) {
    await deleteProduct(product.id);
    await loadProducts();
  }

  return {
    rows,
    isLoading,
    handleDelete,
  };
}
