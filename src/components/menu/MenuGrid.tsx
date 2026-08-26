"use client";

import { ProductCard } from "./ProductCard";
import type { MenuResponse } from "@/types/menu";
import { Reveal } from "../common/Reveal";
import { Container } from "../ui/Container";
import MenuBackgroundDecoration from "../ui/MenuBackgroundDecoration";
import { categories, useMenuGrid, type MenuCategory } from "./useMenuGrid";

/**
 * Trả về màu của nút danh mục.
 *
 * Khi nút đang được chọn:
 * - Nền có màu.
 * - Chữ màu trắng.
 *
 * Khi chưa được chọn:
 * - Nền trắng.
 * - Viền và chữ theo từng nhóm món.
 */
function getCategoryButtonClass(
  category: MenuCategory,
  isActive: boolean,
) {
  const baseClass =
    "rounded-[5px] border px-3 py-1 text-[11px] font-black leading-none transition hover:opacity-90 active:scale-95";

  if (isActive) {
    switch (category) {
      case "Món mặn":
        return `${baseClass} border-brand-red bg-brand-red text-white`;

      case "Ăn kèm":
        return `${baseClass} border-orange-500 bg-orange-500 text-white`;

      case "Tất cả":
      case "Món chay":
      default:
        return `${baseClass} border-brand-green bg-brand-green text-white`;
    }
  }

  switch (category) {
    case "Món mặn":
      return `${baseClass} border-brand-red bg-white text-brand-red`;

    case "Ăn kèm":
      return `${baseClass} border-orange-500 bg-white text-orange-600`;

    case "Tất cả":
    case "Món chay":
    default:
      return `${baseClass} border-brand-green bg-white text-brand-green`;
  }
}

/* =========================================================
 * PROPS
 * ======================================================= */

interface MenuGridProps {
  groups: MenuResponse["data"]["menu"]["groups"];
}

/* =========================================================
 * COMPONENT
 * ======================================================= */

export default function MenuGrid({
  groups,
}: MenuGridProps) {
  const {
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
  } = useMenuGrid(groups);

  /* =======================================================
   * GIAO DIỆN
   * ===================================================== */

  return (
    <section className="relative w-full  pb-40 pt-24 " >
       <MenuBackgroundDecoration leftColor="#FF9418" rightColor="#F5C884" />
      <Container className="mx-auto max-w-[790px] px-5 md:px-0">
        {/* Tiêu đề */}
        <h1 className="heading-1 mb-24 text-center text-brand-green">
          Hôm nay bạn muốn ăn gì?
        </h1>

        {/* =================================================
         * THANH TÌM KIẾM
         * =============================================== */}
        <div className="relative mb-4">
          {/* Icon tìm kiếm */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-green"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />

              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              handleSearchChange(event.target.value)
            }
            placeholder="Tìm kiếm món ăn..."
            aria-label="Tìm kiếm món ăn"
            className="
              h-8 w-full rounded-[9px]
              border-[1.5px] border-brand-green
              bg-white pl-8 pr-9
              text-[12px] text-gray-800
              outline-none transition
              placeholder:text-gray-400
              focus:border-green-700
              focus:ring-2 focus:ring-green-600/15
              [&::-webkit-search-cancel-button]:hidden
            "
          />

          {/* Nút xóa từ khóa chỉ xuất hiện khi đang nhập */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Xóa từ khóa tìm kiếm"
              className="
                absolute right-2.5 top-1/2
                flex h-5 w-5 -translate-y-1/2
                items-center justify-center
                rounded-full text-[14px]
                text-gray-400 transition
                hover:bg-gray-100 hover:text-gray-700
              "
            >
              ×
            </button>
          )}
        </div>

        {/* =================================================
         * BỘ LỌC DANH MỤC
         * =============================================== */}
        <div className="mb-14 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive =
              activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  handleCategoryChange(category)
                }
                className={getCategoryButtonClass(
                  category,
                  isActive,
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* =================================================
         * DANH SÁCH SẢN PHẨM
         * =============================================== */}
        {visibleItems.length > 0 ? (
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
            {visibleItems.map((item, index) => (
              <Reveal type="fade-up" delay={index * 0.06} duration={0.45} key={item.id} className="w-full">
                <ProductCard item={item} />
              </Reveal>
            ))}
          </div>
        ) : (
          /* Trạng thái không tìm thấy sản phẩm */
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-5 py-12 text-center">
            <p className="font-bold text-brand-green">
              Không tìm thấy món ăn
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Hãy thử từ khóa hoặc danh mục khác.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-md bg-brand-green px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              Xem tất cả món
            </button>
          </div>
        )}

        {/* =================================================
         * THÔNG TIN SỐ LƯỢNG SẢN PHẨM
         * =============================================== */}
        {filteredItems.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-500">
            Đang hiển thị{" "}
            {Math.min(
              visibleCount,
              filteredItems.length,
            )}{" "}
            / {filteredItems.length} sản phẩm
          </p>
        )}

        {/* =================================================
         * NÚT XEM THÊM VÀ THU GỌN
         * =============================================== */}
        {(hasMoreItems || canCollapse) && (
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {/* Chỉ hiện khi vẫn còn sản phẩm chưa hiển thị */}
            {hasMoreItems && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="
                  rounded-md bg-brand-red
                  px-16 py-3
                  text-[18px] font-bold text-white
                  transition
                  hover:opacity-90
                  active:scale-[0.98]
                "
              >
                Xem thêm
              </button>
            )}

            {/* Chỉ hiện khi danh sách đang lớn hơn 12 món */}
            {canCollapse && (
              <button
                type="button"
                onClick={handleCollapse}
                className="
                  rounded-md border-2 border-brand-red
                  bg-white px-12 py-3
                  text-[18px] font-bold text-brand-red
                  transition
                  hover:bg-brand-red hover:text-white
                  active:scale-[0.98]
                "
              >
                Thu gọn
              </button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
