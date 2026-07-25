"use client";

import type { ChangeEvent } from "react";

export type MenuCategory =
  | "Tất cả"
  | "Món mặn"
  | "Món chay"
  | "Ăn kèm";

interface MenuToolbarProps {
  searchTerm: string;
  activeCategory: MenuCategory;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: MenuCategory) => void;
}

const categories: MenuCategory[] = [
  "Tất cả",
  "Món mặn",
  "Món chay",
  "Ăn kèm",
];

const inactiveCategoryClasses: Record<
  MenuCategory,
  string
> = {
  "Tất cả":
    "border-brand-green text-brand-green hover:bg-green-50",

  "Món mặn":
    "border-tayho-red text-tayho-red hover:bg-red-50",

  "Món chay":
    "border-brand-green text-brand-green hover:bg-green-50",

  "Ăn kèm":
    "border-orange-400 text-orange-600 hover:bg-orange-50",
};

const activeCategoryClasses: Record<
  MenuCategory,
  string
> = {
  "Tất cả": "border-brand-green bg-brand-green text-white",

  "Món mặn": "border-tayho-red bg-tayho-red text-white",

  "Món chay":
    "border-brand-green bg-brand-green text-white",

  "Ăn kèm":
    "border-orange-500 bg-orange-500 text-white",
};

export function MenuToolbar({
  searchTerm,
  activeCategory,
  onSearchChange,
  onCategoryChange,
}: MenuToolbarProps) {
  function handleSearchChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    onSearchChange(event.target.value);
  }

  return (
    <div className="mb-14">
      {/* Thanh tìm kiếm */}
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
          onChange={handleSearchChange}
          placeholder="Tìm kiếm món ăn..."
          aria-label="Tìm kiếm món ăn"
          className="
            h-8 w-full rounded-[9px]
            border-[1.5px] border-brand-green
            bg-white pl-8 pr-4
            text-[12px] text-gray-800
            outline-none transition
            placeholder:text-gray-400
            focus:border-green-700
            focus:ring-2 focus:ring-green-600/15
          "
        />
      </div>

      {/* Bộ lọc danh mục */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive =
            activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                onCategoryChange(category)
              }
              className={`
                rounded-[5px] border
                px-3 py-1
                text-[11px] font-black
                leading-none transition
                active:scale-95
                ${
                  isActive
                    ? activeCategoryClasses[category]
                    : inactiveCategoryClasses[category]
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}