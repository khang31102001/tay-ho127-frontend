"use client";

import { useEffect, useMemo, useState } from "react";

import { listCategories } from "@/features/categories";
import { listProducts, type ManagedProduct } from "@/features/products";
import { useAsyncData } from "@/hooks/useAsyncData";
import { normalizeText } from "@/lib/normalize-text";

import {
  createMenuProduct,
  deleteMenuProduct,
  listMenuProducts,
  updateMenuProduct,
} from "../services/menu-product.service";
import type { ManagedMenuProduct } from "../types/menu-product.types";

export type PickerProduct = ManagedProduct & { categoryName: string };

function matchesQuery(product: PickerProduct, query: string): boolean {
  if (!query) return true;
  return normalizeText(`${product.name} ${product.slug} ${product.categoryName}`).includes(query);
}

function isSameOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * State cho khu vực chọn sản phẩm của 1 thực đơn: danh sách đã chọn (có thứ tự)
 * so với bản đã lưu ở Backend. Lưu = diff theo liên kết Menu-SP (xóa / thêm / đổi
 * sortOrder), giữ nguyên giá riêng và "còn hàng" của các liên kết đã có.
 */
export function useMenuProductsPicker(menuId: string) {
  const catalog = useAsyncData(() => Promise.all([listProducts(), listCategories()]), [], {
    fallbackError: "Không thể tải danh sách sản phẩm.",
  });
  const links = useAsyncData(
    async () => (await listMenuProducts()).filter((link) => link.menuId === menuId).sort((a, b) => a.sortOrder - b.sortOrder),
    [menuId],
    { fallbackError: "Không thể tải sản phẩm của thực đơn." },
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [availableQuery, setAvailableQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const savedLinks: ManagedMenuProduct[] | undefined = links.data;
  const savedIds = useMemo(() => (savedLinks ?? []).map((link) => link.productId), [savedLinks]);

  // Đồng bộ lại với Backend mỗi khi tải xong (lần đầu và sau khi lưu).
  useEffect(() => {
    setSelectedIds(savedIds);
  }, [savedIds]);

  const products = useMemo<PickerProduct[]>(() => {
    const [productList, categoryList] = catalog.data ?? [[], []];
    const categoryNameById = new Map(categoryList.map((category) => [category.id, category.name]));
    return productList.map((product) => ({
      ...product,
      categoryName: categoryNameById.get(product.categoryId) ?? "Chưa phân loại",
    }));
  }, [catalog.data]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const availableProducts = useMemo(() => {
    const query = normalizeText(availableQuery);
    return products.filter((product) => matchesQuery(product, query));
  }, [products, availableQuery]);

  // Giữ index gốc để kéo-thả vẫn đúng khi đang lọc theo search.
  const selectedProducts = useMemo(() => {
    const query = normalizeText(selectedQuery);
    return selectedIds
      .map((id, index) => ({ id, index, product: productById.get(id) }))
      .filter(({ product }) => (product ? matchesQuery(product, query) : !query));
  }, [selectedIds, selectedQuery, productById]);

  const addedCount = selectedIds.filter((id) => !savedIds.includes(id)).length;
  const removedCount = savedIds.filter((id) => !selectedIdSet.has(id)).length;
  const keptSelected = selectedIds.filter((id) => savedIds.includes(id));
  const keptSaved = savedIds.filter((id) => selectedIdSet.has(id));
  const isReordered = !isSameOrder(keptSelected, keptSaved);
  const changeCount = addedCount + removedCount + (isReordered ? 1 : 0);

  function toggleProduct(productId: string) {
    setSelectedIds((previous) =>
      previous.includes(productId) ? previous.filter((id) => id !== productId) : [...previous, productId],
    );
  }

  function removeProduct(productId: string) {
    setSelectedIds((previous) => previous.filter((id) => id !== productId));
  }

  function moveProduct(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setSelectedIds((previous) => {
      const next = [...previous];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function discardChanges() {
    setSelectedIds(savedIds);
    setSaveError(null);
  }

  async function save() {
    if (!savedLinks) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const linkByProductId = new Map(savedLinks.map((link) => [link.productId, link]));

      await Promise.all(
        savedLinks.filter((link) => !selectedIdSet.has(link.productId)).map((link) => deleteMenuProduct(link.id)),
      );
      await Promise.all(
        selectedIds.map((productId, index) => {
          const existing = linkByProductId.get(productId);

          if (!existing) {
            return createMenuProduct({ menuId, productId, sortOrder: index, isAvailable: true });
          }
          if (existing.sortOrder === index) return undefined;

          const { id, ...rest } = existing;
          return updateMenuProduct(id, { ...rest, sortOrder: index });
        }),
      );

      await links.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Không thể lưu thực đơn.");
      // Một phần thay đổi có thể đã lưu: tải lại để UI khớp với Backend.
      await links.reload();
    } finally {
      setIsSaving(false);
    }
  }

  return {
    isLoading: catalog.isLoading || links.isLoading,
    loadError: catalog.error ?? links.error,
    availableProducts,
    selectedProducts,
    selectedIdSet,
    selectedCount: selectedIds.length,
    availableQuery,
    setAvailableQuery,
    selectedQuery,
    setSelectedQuery,
    changeCount,
    isSaving,
    saveError,
    toggleProduct,
    removeProduct,
    moveProduct,
    discardChanges,
    save,
  };
}
