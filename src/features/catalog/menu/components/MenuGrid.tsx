"use client";

import { MenuItemCard } from "./MenuItemCard";
import type { MenuResponse, UiProduct } from "../types/menu.types";
import { Container } from "@/shared/ui/Container";
import MenuBackgroundDecoration from "@/shared/ui/MenuBackgroundDecoration";
import { SECTION_SCROLL_OFFSET_CLASS, useMenuGrid } from "../hooks/useMenuGrid";

interface MenuGridProps {
  groups: MenuResponse["data"]["menu"]["groups"];
  /** Món của thực đơn `mon-yeu-thich`; rỗng thì không hiện section này. */
  featured: UiProduct[];
}

export default function MenuGrid({ groups, featured }: MenuGridProps) {
  const {
    searchTerm,
    activeSectionId,
    visibleSections,
    totalVisibleItems,
    handleSearchChange,
    handleClearSearch,
    handleSectionSelect,
  } = useMenuGrid(groups, featured);

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
          <>
            {/* Thanh tab sticky dưới header cố định (64px mobile / 68px md+) */}
            <nav
              aria-label="Danh mục món"
              className="sticky top-[64px] z-30 -mx-4 mb-6 bg-brand-cream/95 px-4 py-2 backdrop-blur md:top-[68px]"
            >
              <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visibleSections.map((section) => {
                  const isActive = section.id === activeSectionId;

                  return (
                    <li key={section.id} className="shrink-0">
                      <button
                        type="button"
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => handleSectionSelect(section.id)}
                        className={`rounded-md border px-3 py-1.5 text-[13px] font-bold transition active:scale-95 ${
                          isActive
                            ? "border-brand-red bg-brand-red text-white"
                            : "border-brand-red/50 bg-white text-brand-red hover:bg-brand-red/5"
                        }`}
                      >
                        {section.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {visibleSections.map((section) => (
              <div
                key={section.id}
                id={`menu-section-${section.id}`}
                className={`mb-10 ${SECTION_SCROLL_OFFSET_CLASS}`}
              >
                <h2 className="mb-3 text-[20px] font-extrabold text-brand-greenDark sm:text-[24px]">
                  {section.name}
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                  {section.items.map((item) => (
                    <MenuItemCard key={item.productId} item={item} />
                  ))}
                </div>
              </div>
            ))}

            <p className="text-center text-xs text-gray-500">{totalVisibleItems} món</p>
          </>
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
