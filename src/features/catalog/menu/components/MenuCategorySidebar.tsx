"use client";

import type { MenuCategoryOption } from "../hooks/useMenuGrid";

interface MenuCategorySidebarProps {
  categories: MenuCategoryOption[];
  /** null = "Tất cả". */
  activeCategoryId: string | null;
  totalCount: number;
  onSelect: (id: string | null) => void;
}

/**
 * Bộ lọc danh mục của /thuc-don. Desktop: cột dọc sticky bên trái.
 * Mobile: hàng chip cuộn ngang sticky dưới header (cùng một danh sách, đổi bố cục bằng CSS).
 */
export function MenuCategorySidebar({
  categories,
  activeCategoryId,
  totalCount,
  onSelect,
}: MenuCategorySidebarProps) {
  const options: { id: string | null; name: string; count: number }[] = [
    { id: null, name: "Tất cả", count: totalCount },
    ...categories,
  ];

  return (
    <nav
      aria-label="Danh mục món"
      className="sticky top-[64px] z-30 -mx-4 mb-6 bg-brand-cream/95 px-4 py-2 backdrop-blur md:top-[68px] lg:top-[92px] lg:z-10 lg:mx-0 lg:mb-0 lg:self-start lg:rounded-md lg:border lg:border-brand-red/40 lg:bg-white lg:p-3 lg:backdrop-blur-none"
    >
      <p className="mb-2 hidden text-[13px] font-extrabold uppercase tracking-wide text-brand-greenDark lg:block">
        Danh mục
      </p>

      <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-1.5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const isActive = option.id === activeCategoryId;

          return (
            <li key={option.id ?? "all"} className="shrink-0">
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(option.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-left text-[13px] font-bold transition active:scale-95 ${
                  isActive
                    ? "border-brand-red bg-brand-red text-white"
                    : "border-brand-red/50 bg-white text-brand-red hover:bg-brand-red/5"
                }`}
              >
                <span>{option.name}</span>
                <span className={`text-[12px] font-semibold ${isActive ? "text-white/80" : "text-brand-muted"}`}>
                  {option.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
