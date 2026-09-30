"use client";

import { useMemo } from "react";

import { listMenus } from "@/features/menus";
import { listProducts } from "@/features/products";
import { useAsyncData } from "@/hooks/useAsyncData";

import type {
  ManagedMenuProduct,
  ManagedMenuProductRow,
} from "../types/menu-product.types";
import {
  deleteMenuProduct,
  listMenuProducts,
} from "../services/menu-product.service";

export function useMenuProductsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => Promise.all([listMenuProducts(), listMenus(), listProducts()]),
    [],
    { fallbackError: "Không thể tải liên kết thực đơn – sản phẩm." },
  );

  const rows = useMemo<ManagedMenuProductRow[]>(() => {
    const [menuProducts, menus, products] = data ?? [[], [], []];
    const menuNameById = new Map(menus.map((menu) => [menu.id, menu.name]));
    const productById = new Map(products.map((product) => [product.id, product]));

    return menuProducts.map((item) => {
      const product = productById.get(item.productId);

      return {
        ...item,
        menuName: menuNameById.get(item.menuId) ?? "—",
        productName: product?.name ?? "—",
        effectivePrice: item.priceOverride ?? product?.price ?? 0,
      };
    });
  }, [data]);

  async function handleDelete(item: ManagedMenuProduct) {
    await deleteMenuProduct(item.id);
    await reload();
  }

  return {
    rows,
    isLoading,
    loadError: error,
    handleDelete,
  };
}
