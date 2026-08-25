"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "./ProductCard";
import type { MenuResponse, UiProduct } from "@/types/menu";
import { Reveal } from "../common/animation";
import { Container } from "../ui/Container";
import { site } from "@/data/site";
import MenuBackgroundDecoration from "../ui/menu-background-decoration";

/* =========================================================
 * CẤU HÌNH HIỂN THỊ
 * ======================================================= */

/**
 * Các danh mục được hiển thị trên thanh bộ lọc.
 * `as const` giúp TypeScript hiểu đây là các giá trị cố định.
 */
const categories = [
  "Tất cả",
  "Món mặn",
  "Món chay",
  "Ăn kèm",
] as const;

type MenuCategory = (typeof categories)[number];

/**
 * Số sản phẩm hiển thị mặc định.
 */
const INITIAL_VISIBLE_COUNT = 12;

/**
 * Số sản phẩm hiển thị thêm sau mỗi lần bấm "Xem thêm".
 */
const LOAD_MORE_COUNT = 12;

/* =========================================================
 * HÀM HỖ TRỢ
 * ======================================================= */

/**
 * Chuẩn hóa chuỗi để tìm kiếm:
 * - Không phân biệt chữ hoa, chữ thường.
 * - Không phân biệt dấu tiếng Việt.
 *
 * Ví dụ:
 * "Bánh Cuốn" -> "banh cuon"
 */
function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

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
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("Tất cả");
                setVisibleCount(
                  INITIAL_VISIBLE_COUNT,
                );
              }}
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