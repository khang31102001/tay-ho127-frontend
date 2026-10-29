"use client";

import Link from "next/link";
import { ChevronDown, Filter, Plus, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { adminButtonClassName, adminControlClassName } from "../formFieldClassName";

type DataExplorerToolbarProps = {
  searchTerm: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  filters?: ReactNode;
  advancedFilters?: ReactNode;
  quickActions?: ReactNode;
  utilities?: ReactNode;
  createHref?: string;
  createLabel: string;
};

/**
 * Thanh công cụ ERP của Explorer: [tìm kiếm + kính lúp] [bộ lọc] [Nâng cao] [hành động nhanh] [Tiện ích ▾] ... [Tạo mới].
 * Mỗi khối chỉ hiện khi module truyền vào — template không tự thêm chức năng nghiệp vụ.
 */
export function DataExplorerToolbar({
  searchTerm,
  searchPlaceholder,
  onSearchChange,
  onSearchSubmit,
  filters,
  advancedFilters,
  quickActions,
  utilities,
  createHref,
  createLabel,
}: DataExplorerToolbarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const advancedPanelId = useId();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <form
          role="search"
          className="flex w-full sm:w-[300px]"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={`${adminControlClassName} relative min-w-0 flex-1 rounded-r-none focus:z-[1]`}
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="-ml-px flex h-admin-control w-10 shrink-0 items-center justify-center rounded-r-admin border border-admin-border bg-admin-subtle text-admin-textSecondary outline-none transition-colors duration-admin hover:bg-admin-tableHeader focus-visible:ring-2 focus-visible:ring-admin-focus/50"
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
        </form>

        {filters}

        {advancedFilters && (
          <button
            type="button"
            aria-expanded={isAdvancedOpen}
            aria-controls={advancedPanelId}
            onClick={() => setIsAdvancedOpen((isOpen) => !isOpen)}
            className={`${adminButtonClassName.secondary} ${isAdvancedOpen ? "bg-admin-subtle" : ""}`}
          >
            Nâng cao
            <Filter className="size-4" aria-hidden="true" />
          </button>
        )}

        {quickActions}

        {utilities && <UtilitiesMenu>{utilities}</UtilitiesMenu>}

        {createHref && (
          <Link href={createHref} className={`${adminButtonClassName.primary} sm:ml-auto`}>
            <Plus className="size-4" aria-hidden="true" />
            {createLabel}
          </Link>
        )}
      </div>

      {advancedFilters && (
        <div
          id={advancedPanelId}
          hidden={!isAdvancedOpen}
          className="mt-3 rounded-admin border border-admin-border bg-admin-subtle p-3"
        >
          {advancedFilters}
        </div>
      )}
    </div>
  );
}

/**
 * Menu "Tiện ích". Nội dung luôn được mount (chỉ ẩn bằng `hidden`) vì các mục như Nhập file giữ state và dialog
 * (render qua portal) bên trong — unmount khi đóng menu sẽ làm mất dialog đang mở.
 */
function UtilitiesMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
        className={adminButtonClassName.outline}
      >
        Tiện ích
        <ChevronDown className="size-4" aria-hidden="true" />
      </button>

      <div
        id={menuId}
        hidden={!isOpen}
        // Bấm 1 mục là đóng menu (mục vẫn mount nên dialog của nó tiếp tục mở được).
        onClick={() => setIsOpen(false)}
        className="absolute left-0 z-20 mt-1 min-w-[200px] overflow-hidden rounded-admin border border-admin-border bg-admin-surface py-1 shadow-admin-dropdown"
      >
        {children}
      </div>
    </div>
  );
}

type DataExplorerFilterSelectProps<TValue extends string> = {
  value: TValue;
  onChange: (value: TValue) => void;
  options: readonly { value: TValue; label: string }[];
  /** Nhãn cho trình đọc màn hình (select không có label hiển thị). */
  ariaLabel: string;
};

/** Dropdown lọc trên toolbar Explorer (vd. "Tất cả trạng thái") — style chung cho mọi module. */
export function DataExplorerFilterSelect<TValue extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: DataExplorerFilterSelectProps<TValue>) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value as TValue)}
        className={`${adminControlClassName} min-w-[180px] cursor-pointer appearance-none pr-9 text-admin-primary`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-admin-text">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-admin-primary"
        aria-hidden="true"
      />
    </div>
  );
}
