"use client";

import { useMemo, useState } from "react";

import { normalizeText } from "@/lib/normalize-text";
import type { MenuResponse, UiProduct } from "../types/menu.types";

/**
 * Các danh mục được hiển thị trên thanh bộ lọc.
 * `as const` giúp TypeScript hiểu đây là các giá trị cố định.
 */
export const categories = [
  "Tất cả",
  "Món mặn",
  "Món chay",
  "Ăn kèm",
] as const;

export type MenuCategory = (typeof categories)[number];

/**
 * Số sản phẩm hiển thị mặc định.
 */
const INITIAL_VISIBLE_COUNT = 12;

/**
 * Số sản phẩm hiển thị thêm sau mỗi lần bấm "Xem thêm".
 */
const LOAD_MORE_COUNT = 12;

export function useMenuGrid(groups: MenuResponse["data"]["menu"]["groups"]) {
  /**
   * Từ khóa người dùng nhập vào ô tìm kiếm.
   */
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Danh mục đang được chọn.
   */
  const [activeCategory, setActiveCategory] =
    useState<MenuCategory>("Tất cả");

  /**
   * Số lượng sản phẩm đang được hiển thị.
   */
  const [visibleCount, setVisibleCount] = useState(
    INITIAL_VISIBLE_COUNT,
  );

  /* =======================================================
   * 1. CHUYỂN DỮ LIỆU API THÀNH DANH SÁCH UIPRODUCT
   * ===================================================== */

  const items = useMemo<UiProduct[]>(() => {
    const mappedItems: UiProduct[] = [];

    groups.forEach((group) => {
      (group.categories ?? []).forEach((category) => {
        /**
         * Chuẩn hóa tên category để xác định:
         * - Món mặn
         * - Món chay
         * - Ăn kèm
         */
        const normalizedCategoryName = normalizeText(
          category.name ?? "",
        );

        let mappedCategory: UiProduct["category"] =
          "Món mặn";

        if (normalizedCategoryName.includes("chay")) {
          mappedCategory = "Món chay";
        } else if (
          normalizedCategoryName.includes("an kem") ||
          normalizedCategoryName.includes("them")
        ) {
          mappedCategory = "Ăn kèm";
        }

        /**
         * Lấy sản phẩm từ tất cả subCategories
         * và đưa về cùng một mảng.
         */
        (category.subCategories ?? []).forEach(
          (subCategory) => {
            (subCategory.products ?? []).forEach(
              (product) => {
                mappedItems.push({
                  /**
                   * Hiện tại sử dụng số thứ tự làm id.
                   * Sau này nên thay bằng product.id từ API
                   * nếu API có trả về id duy nhất.
                   */
                  id: mappedItems.length + 1,

                  slug: product.slug || product.id,

                  name:
                    product.name?.vi ||
                    product.name?.en ||
                    product.slug ||
                    "Sản phẩm chưa có tên",

                  category: mappedCategory,

                  price: product.price?.amount ?? 0,

                  oldPrice: undefined,

                  badge:
                    product.productType || undefined,

                  rating: 0,

                  ratingCount: 0,

                  image:
                    product.imageUrl ||
                    "/images/banh-cuon-dish.jpg",
                });
              },
            );
          },
        );
      });
    });

    return mappedItems;
  }, [groups]);

  /* =======================================================
   * 2. LỌC SẢN PHẨM THEO TỪ KHÓA VÀ DANH MỤC
   * ===================================================== */

  const filteredItems = useMemo(() => {
    const normalizedSearchTerm =
      normalizeText(searchTerm);

    return items.filter((item) => {
      /**
       * Kiểm tra sản phẩm có thuộc danh mục đang chọn không.
       */
      const matchesCategory =
        activeCategory === "Tất cả" ||
        item.category === activeCategory;

      /**
       * Chuỗi dùng để tìm kiếm.
       * Có thể bổ sung description hoặc slug vào đây
       * khi UiProduct có thêm các field đó.
       */
      const searchableText = normalizeText(
        [
          item.name,
          item.category,
          item.badge ?? "",
        ].join(" "),
      );

      /**
       * Khi ô tìm kiếm trống, tất cả sản phẩm đều hợp lệ.
       */
      const matchesSearch =
        normalizedSearchTerm === "" ||
        searchableText.includes(normalizedSearchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [items, searchTerm, activeCategory]);

  /* =======================================================
   * 3. DANH SÁCH SẢN PHẨM ĐANG HIỂN THỊ
   * ===================================================== */

  /**
   * Chỉ lấy số lượng sản phẩm theo visibleCount.
   */
  const visibleItems = filteredItems.slice(
    0,
    visibleCount,
  );

  /**
   * Còn sản phẩm chưa được hiển thị hay không.
   */
  const hasMoreItems =
    visibleCount < filteredItems.length;

  /**
   * Có thể thu gọn hay không.
   */
  const canCollapse =
    visibleCount > INITIAL_VISIBLE_COUNT;

  /* =======================================================
   * 4. CÁC HÀM XỬ LÝ SỰ KIỆN
   * ===================================================== */

  /**
   * Xử lý khi người dùng nhập từ khóa.
   *
   * Khi tìm kiếm mới, danh sách tự quay lại
   * số lượng mặc định là 12 sản phẩm.
   */
  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  /**
   * Xử lý khi người dùng chọn danh mục.
   *
   * Khi đổi danh mục, danh sách tự quay lại
   * số lượng mặc định là 12 sản phẩm.
   */
  function handleCategoryChange(
    category: MenuCategory,
  ) {
    setActiveCategory(category);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  /**
   * Hiển thị thêm 12 sản phẩm.
   *
   * Math.min giúp visibleCount không vượt quá
   * tổng số sản phẩm sau khi lọc.
   */
  function handleLoadMore() {
    setVisibleCount((currentCount) =>
      Math.min(
        currentCount + LOAD_MORE_COUNT,
        filteredItems.length,
      ),
    );
  }

  /**
   * Thu gọn danh sách về 12 sản phẩm.
   */
  function handleCollapse() {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  /**
   * Xóa nhanh từ khóa tìm kiếm.
   */
  function handleClearSearch() {
    setSearchTerm("");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  /**
   * Xóa bộ lọc + từ khóa, quay về trạng thái mặc định.
   * Dùng cho nút "Xem tất cả món" khi không tìm thấy sản phẩm.
   */
  function resetFilters() {
    setSearchTerm("");
    setActiveCategory("Tất cả");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  return {
    items,
    searchTerm,
    activeCategory,
    visibleCount,
    filteredItems,
    visibleItems,
    hasMoreItems,
    canCollapse,
    handleSearchChange,
    handleCategoryChange,
    handleLoadMore,
    handleCollapse,
    handleClearSearch,
    resetFilters,
  };
}
