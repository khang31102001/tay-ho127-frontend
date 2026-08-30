"use client";

import { cn } from "@/lib/cn";

import type { NewsCategoryOption } from "../types/news.types";

export const ALL_CATEGORY_VALUE = "all";

type NewsCategoryFilterProps = {
  categories: NewsCategoryOption[];
  selected: string;
  onChange: (value: string) => void;
};

/** Danh mục lấy từ listNewsCategories() — không hard-code danh sách trong UI. */
export function NewsCategoryFilter({ categories, selected, onChange }: NewsCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo danh mục tin tức">
      <FilterButton label="Tất cả" isActive={selected === ALL_CATEGORY_VALUE} onClick={() => onChange(ALL_CATEGORY_VALUE)} />

      {categories.map((category) => (
        <FilterButton
          key={category.id}
          label={category.name}
          isActive={selected === category.slug}
          onClick={() => onChange(category.slug)}
        />
      ))}
    </div>
  );
}

type FilterButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "focus-ring rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition",
        isActive
          ? "border-brand-red bg-brand-red text-white"
          : "border-brand-line bg-white text-brand-muted hover:border-brand-red hover:text-brand-red",
      )}
    >
      {label}
    </button>
  );
}
