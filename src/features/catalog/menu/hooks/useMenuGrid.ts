"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeText } from "@/core/utils/normalize-text";
import type { MenuResponse, UiProduct } from "../types/menu.types";

/**
 * Một section trên trang thực đơn = một danh mục cấp 2 của Catalog
 * (hoặc section "Món yêu thích" lấy từ thực đơn `mon-yeu-thich`).
 * Thứ tự và tên do Admin quản lý, không còn đoán theo từ khóa.
 */
export interface MenuSection {
  id: string;
  name: string;
  items: UiProduct[];
}

export const FAVORITES_SECTION_ID = "mon-yeu-thich";

/** Vạch "đã cuộn tới section": nằm dưới header cố định + thanh tab sticky. */
const SCROLL_SPY_ROOT_MARGIN = "-140px 0px -60% 0px";

/** Chiều cao header cố định + thanh tab sticky, để cuộn tới section không bị che. */
export const SECTION_SCROLL_OFFSET_CLASS = "scroll-mt-32 md:scroll-mt-36";

export function useMenuGrid(
  groups: MenuResponse["data"]["menu"]["groups"],
  featured: UiProduct[],
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  /** Chặn scroll-spy ghi đè tab vừa bấm trong lúc trang đang cuộn mượt. */
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* 1. API → danh sách section (theo danh mục cấp 2) */
  const sections = useMemo<MenuSection[]>(() => {
    const result: MenuSection[] = [];

    if (featured.length > 0) {
      result.push({ id: FAVORITES_SECTION_ID, name: "Món yêu thích", items: featured });
    }

    let runningId = 0;

    groups.forEach((group) => {
      (group.categories ?? []).forEach((category) => {
        const items: UiProduct[] = [];
        const sortOrderByProductId = new Map<string, number>();

        (category.subCategories ?? []).forEach((subCategory) => {
          (subCategory.products ?? []).forEach((product) => {
            runningId += 1;
            sortOrderByProductId.set(product.id, product.sortOrder ?? Number.MAX_SAFE_INTEGER);
            items.push({
              id: runningId,
              productId: product.id,
              slug: product.slug || product.id,
              name: product.name?.vi || product.name?.en || product.slug || "Sản phẩm chưa có tên",
              category: category.name ?? "",
              price: product.price?.amount ?? 0,
              oldPrice: undefined,
              badge: product.productType || undefined,
              rating: 0,
              ratingCount: 0,
              image: product.imageUrl || "/images/banh-cuon-dish.jpg",
            });
          });
        });

        // Cây gom món theo danh mục con nên lệch thứ tự: sắp lại theo "Thứ tự" Menu-SP của Admin (sort ổn định).
        items.sort(
          (a, b) =>
            (sortOrderByProductId.get(a.productId) ?? Number.MAX_SAFE_INTEGER) -
            (sortOrderByProductId.get(b.productId) ?? Number.MAX_SAFE_INTEGER),
        );

        if (items.length > 0) {
          result.push({
            id: category.id,
            name: category.name ?? "Khác",
            items,
          });
        }
      });
    });

    return result;
  }, [groups, featured]);

  /* 2. Lọc theo từ khóa; section rỗng bị ẩn khỏi cả danh sách lẫn thanh tab */
  const visibleSections = useMemo<MenuSection[]>(() => {
    const keyword = normalizeText(searchTerm);
    if (keyword === "") {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          normalizeText([item.name, section.name, item.badge ?? ""].join(" ")).includes(keyword),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, searchTerm]);

  const totalVisibleItems = useMemo(
    () => visibleSections.reduce((sum, section) => sum + section.items.length, 0),
    [visibleSections],
  );

  /* 3. Scroll-spy: tab sáng theo section đang xem */
  const sectionIds = useMemo(() => visibleSections.map((section) => section.id), [visibleSections]);
  const sectionKey = sectionIds.join("|");

  useEffect(() => {
    setActiveSectionId(sectionIds[0] ?? null);

    if (sectionIds.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) {
          return;
        }

        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (inView) {
          setActiveSectionId(inView.target.id.replace(/^menu-section-/, ""));
        }
      },
      { rootMargin: SCROLL_SPY_ROOT_MARGIN },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(`menu-section-${id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
    // sectionKey đại diện cho sectionIds (mảng mới mỗi lần render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  useEffect(() => () => clearTimeout(scrollTimerRef.current), []);

  /* 4. Handlers */
  const handleSearchChange = useCallback((value: string) => setSearchTerm(value), []);
  const handleClearSearch = useCallback(() => setSearchTerm(""), []);

  const handleSectionSelect = useCallback((id: string) => {
    const element = document.getElementById(`menu-section-${id}`);
    if (!element) {
      return;
    }

    setActiveSectionId(id);
    isProgrammaticScrollRef.current = true;
    clearTimeout(scrollTimerRef.current);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800);
  }, []);

  return {
    searchTerm,
    activeSectionId,
    visibleSections,
    totalVisibleItems,
    handleSearchChange,
    handleClearSearch,
    handleSectionSelect,
  };
}
