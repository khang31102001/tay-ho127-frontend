"use client";

import { useCallback, useMemo, useState } from "react";

import { normalizeText } from "@/core/utils/normalize-text";
import type { MenuSectionData } from "../types/menu.types";

/** Một mục ở cột lọc danh mục (danh mục cấp 2 của Catalog). */
export interface MenuCategoryOption {
  id: string;
  name: string;
  count: number;
}

/**
 * Trạng thái trang /thuc-don: mỗi thực đơn (Menu) là một section, cột trái lọc
 * theo danh mục, ô tìm kiếm lọc theo tên món. Section rỗng sau khi lọc bị ẩn.
 */
export function useMenuGrid(sections: MenuSectionData[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  /* 1. Lọc theo từ khóa (chưa lọc danh mục — để cột trái luôn đếm đúng) */
  const searchedSections = useMemo<MenuSectionData[]>(() => {
    const keyword = normalizeText(searchTerm);
    if (keyword === "") {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          normalizeText([item.name, section.name, item.categoryName ?? "", item.badge ?? ""].join(" ")).includes(
            keyword,
          ),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, searchTerm]);

  /* 2. Danh mục có món (đếm món duy nhất — một món nằm ở nhiều menu chỉ tính một lần) */
  const categories = useMemo<MenuCategoryOption[]>(() => {
    const productIdsByCategory = new Map<string, { name: string; productIds: Set<string> }>();

    searchedSections.forEach((section) => {
      section.items.forEach((item) => {
        if (!item.categoryId) {
          return;
        }

        const entry = productIdsByCategory.get(item.categoryId) ?? {
          name: item.categoryName ?? "Khác",
          productIds: new Set<string>(),
        };
        entry.productIds.add(item.productId);
        productIdsByCategory.set(item.categoryId, entry);
      });
    });

    return Array.from(productIdsByCategory, ([id, entry]) => ({
      id,
      name: entry.name,
      count: entry.productIds.size,
    }));
  }, [searchedSections]);

  /** Danh mục đang chọn mà không còn món (do tìm kiếm) thì coi như "Tất cả". */
  const activeCategoryId =
    selectedCategoryId !== null && categories.some((category) => category.id === selectedCategoryId)
      ? selectedCategoryId
      : null;

  /* 3. Áp danh mục */
  const visibleSections = useMemo<MenuSectionData[]>(() => {
    if (activeCategoryId === null) {
      return searchedSections;
    }

    return searchedSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.categoryId === activeCategoryId),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchedSections, activeCategoryId]);

  const totalVisibleItems = useMemo(
    () => new Set(visibleSections.flatMap((section) => section.items.map((item) => item.productId))).size,
    [visibleSections],
  );

  /* 4. Handlers */
  const handleSearchChange = useCallback((value: string) => setSearchTerm(value), []);
  const handleClearSearch = useCallback(() => setSearchTerm(""), []);
  const handleCategorySelect = useCallback((id: string | null) => setSelectedCategoryId(id), []);

  return {
    searchTerm,
    categories,
    activeCategoryId,
    visibleSections,
    totalVisibleItems,
    handleSearchChange,
    handleClearSearch,
    handleCategorySelect,
  };
}
