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

/** Một sản phẩm đang được chọn trong thực đơn, kèm phần riêng của liên kết. */
export type SelectedEntry = {
  productId: string;
  /** Giá riêng trong thực đơn này; undefined = dùng giá gốc của sản phẩm. */
  priceOverride?: number;
  isAvailable: boolean;
};

function isSameOrder(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function toEntry(link: ManagedMenuProduct): SelectedEntry {
  return { productId: link.productId, priceOverride: link.priceOverride, isAvailable: link.isAvailable };
}

/**
 * State cho khu vực chọn sản phẩm của 1 thực đơn: danh sách đã chọn (có thứ tự)
 * so với bản đã lưu ở Backend. Lưu = diff theo liên kết Menu-SP (xóa / thêm / đổi
 * sortOrder, giá riêng, còn hàng).
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

  const [entries, setEntries] = useState<SelectedEntry[]>([]);
  const [availableQuery, setAvailableQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const savedLinks: ManagedMenuProduct[] | undefined = links.data;
  const savedEntries = useMemo(() => (savedLinks ?? []).map(toEntry), [savedLinks]);
  const savedIds = useMemo(() => savedEntries.map((entry) => entry.productId), [savedEntries]);

  // Đồng bộ lại với Backend mỗi khi tải xong (lần đầu và sau khi lưu).
  useEffect(() => {
    setEntries(savedEntries);
  }, [savedEntries]);

  const products = useMemo<PickerProduct[]>(() => {
    const [productList, categoryList] = catalog.data ?? [[], []];
    const categoryNameById = new Map(categoryList.map((category) => [category.id, category.name]));
    return productList.map((product) => ({
      ...product,
      categoryName: categoryNameById.get(product.categoryId) ?? "Chưa phân loại",
    }));
  }, [catalog.data]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const selectedIds = useMemo(() => entries.map((entry) => entry.productId), [entries]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const availableProducts = useMemo(() => {
    const query = normalizeText(availableQuery);
    return products.filter((product) => matchesQuery(product, query));
  }, [products, availableQuery]);

  // Giữ index gốc để kéo-thả vẫn đúng khi đang lọc theo search.
  const selectedProducts = useMemo(() => {
    const query = normalizeText(selectedQuery);
    return entries
      .map((entry, index) => ({ entry, index, product: productById.get(entry.productId) }))
      .filter(({ product }) => (product ? matchesQuery(product, query) : !query));
  }, [entries, selectedQuery, productById]);

  const addedCount = selectedIds.filter((id) => !savedIds.includes(id)).length;
  const removedCount = savedIds.filter((id) => !selectedIdSet.has(id)).length;
  const keptSelected = selectedIds.filter((id) => savedIds.includes(id));
  const keptSaved = savedIds.filter((id) => selectedIdSet.has(id));
  const isReordered = !isSameOrder(keptSelected, keptSaved);
  const savedByProductId = useMemo(() => new Map(savedEntries.map((entry) => [entry.productId, entry])), [savedEntries]);
  // Món đã có trước đó nhưng đổi giá riêng / còn hàng.
  const editedCount = entries.filter((entry) => {
    const saved = savedByProductId.get(entry.productId);
    return saved !== undefined && (saved.priceOverride !== entry.priceOverride || saved.isAvailable !== entry.isAvailable);
  }).length;
  const changeCount = addedCount + removedCount + editedCount + (isReordered ? 1 : 0);

  function toggleProduct(productId: string) {
    setEntries((previous) => {
      if (previous.some((entry) => entry.productId === productId)) {
        return previous.filter((entry) => entry.productId !== productId);
      }
      // Chọn lại món đã lưu thì khôi phục giá riêng/còn hàng đã lưu thay vì mặc định.
      return [...previous, savedByProductId.get(productId) ?? { productId, isAvailable: true }];
    });
  }

  function removeProduct(productId: string) {
    setEntries((previous) => previous.filter((entry) => entry.productId !== productId));
  }

  function updateEntry(productId: string, patch: Partial<Omit<SelectedEntry, "productId">>) {
    setEntries((previous) => previous.map((entry) => (entry.productId === productId ? { ...entry, ...patch } : entry)));
  }

  function moveProduct(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setEntries((previous) => {
      const next = [...previous];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function discardChanges() {
    setEntries(savedEntries);
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
        entries.map(({ productId, priceOverride, isAvailable }, index) => {
          const existing = linkByProductId.get(productId);

          if (!existing) {
            return createMenuProduct({ menuId, productId, priceOverride, sortOrder: index, isAvailable });
          }
          const isUnchanged =
            existing.sortOrder === index &&
            existing.priceOverride === priceOverride &&
            existing.isAvailable === isAvailable;
          if (isUnchanged) return undefined;

          return updateMenuProduct(existing.id, { menuId, productId, priceOverride, sortOrder: index, isAvailable });
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
    selectedCount: entries.length,
    availableQuery,
    setAvailableQuery,
    selectedQuery,
    setSelectedQuery,
    changeCount,
    isSaving,
    saveError,
    toggleProduct,
    removeProduct,
    updateEntry,
    moveProduct,
    discardChanges,
    save,
  };
}
