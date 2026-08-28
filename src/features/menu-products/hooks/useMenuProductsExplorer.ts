"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  ManagedMenuProduct,
  ManagedMenuProductRow,
} from "../types/menu-product.types";
import type { ManagedMenu } from "@/features/menus";
import type { ManagedProduct } from "@/features/products";
import { listMenus } from "@/features/menus";
import {
  deleteMenuProduct,
  listMenuProducts,
} from "../services/menu-product.service";
import { listProducts } from "@/features/products";

export function useMenuProductsExplorer() {
  const [menuProducts, setMenuProducts] = useState<ManagedMenuProduct[]>([]);
  const [menus, setMenus] = useState<ManagedMenu[]>([]);
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMenuProducts = useCallback(async () => {
    setIsLoading(true);

    try {
      const [menuProductData, menuData, productData] = await Promise.all([
        listMenuProducts(),
        listMenus(),
        listProducts(),
      ]);

      setMenuProducts(menuProductData);
      setMenus(menuData);
      setProducts(productData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuProducts();
  }, [loadMenuProducts]);

  const rows = useMemo<ManagedMenuProductRow[]>(() => {
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
  }, [menuProducts, menus, products]);

  async function handleDelete(item: ManagedMenuProduct) {
    await deleteMenuProduct(item.id);
    await loadMenuProducts();
  }

  return {
    rows,
    isLoading,
    handleDelete,
  };
}
