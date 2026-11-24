"use client";

import { MenuCategorySidebar } from "./MenuCategorySidebar";
import { MenuSectionSwiper } from "./MenuSectionSwiper";
import type { MenuSectionData } from "../types/menu.types";
import { Container } from "@/shared/ui/Container";
import MenuBackgroundDecoration from "@/shared/ui/MenuBackgroundDecoration";
import { useMenuGrid } from "../hooks/useMenuGrid";

interface MenuGridProps {
  /** Mỗi thực đơn đang hoạt động (Admin quản lý) là một section. */
  sections: MenuSectionData[];
}

export default function MenuGrid({ sections }: MenuGridProps) {
  const {
    searchTerm,
    categories,
    activeCategoryId,
    visibleSections,
    totalVisibleItems,
    handleSearchChange,
    handleClearSearch,
    handleCategorySelect,
  } = useMenuGrid(sections);

  return (
    <section className="relative isolate w-full pb-32 pt-24">
      <MenuBackgroundDecoration leftColor="#FF9418" rightColor="#F5C884" />
      <Container>
        <h1 className="heading-1 mb-10 text-center text-brand-green">Hôm nay bạn muốn ăn gì?</h1>

        {/* Tìm kiếm */}
        <div className="relative mb-4">
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
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Tìm kiếm món ăn..."
            aria-label="Tìm kiếm món ăn"
            className="
              h-9 w-full rounded-[9px]
              border-[1.5px] border-brand-green
              bg-white pl-8 pr-9
              text-[13px] text-gray-800
              outline-none transition
              placeholder:text-gray-400
              focus:border-green-700
              focus:ring-2 focus:ring-green-600/15
              [&::-webkit-search-cancel-button]:hidden
            "
          />

          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[14px] text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>

        {visibleSections.length > 0 ? (
          <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
            <MenuCategorySidebar
              categories={categories}
              activeCategoryId={activeCategoryId}
              totalCount={totalVisibleItems}
              onSelect={handleCategorySelect}
            />

            <div className="min-w-0">
              {visibleSections.map((section) => (
                <section key={section.id} className="mb-10">
                  <h2 className="mb-3 text-[20px] font-extrabold text-brand-greenDark sm:text-[24px]">
                    {section.name}
                  </h2>

                  <MenuSectionSwiper section={section} />
                </section>
              ))}

              <p className="text-center text-xs text-gray-500">{totalVisibleItems} món</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-5 py-12 text-center">
            <p className="font-bold text-brand-green">Không tìm thấy món ăn</p>
            <p className="mt-1 text-sm text-gray-500">Hãy thử từ khóa khác.</p>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-4 rounded-md bg-brand-green px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
              >
                Xem tất cả món
              </button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
