"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  /** Trang hiện tại, bắt đầu từ 1. */
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

/**
 * UI primitive phân trang — không biết domain nào đang dùng, chỉ nhận
 * page/pageSize/totalItems/onPageChange qua props.
 */
export function Pagination({ page, pageSize, totalItems, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Phân trang"
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-[13px] text-brand-muted">
        Hiển thị <span className="font-bold text-brand-ink">{from}–{to}</span> / {totalItems}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-8 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pageNumbers.map((entry, index) =>
          entry === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1.5 text-brand-muted">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              aria-label={`Trang ${entry}`}
              aria-current={entry === page ? "page" : undefined}
              onClick={() => onPageChange(entry)}
              className={`flex size-8 items-center justify-center rounded-lg text-[13px] font-bold transition ${
                entry === page
                  ? "bg-brand-green text-white"
                  : "text-brand-muted hover:bg-brand-green/10 hover:text-brand-greenDark"
              }`}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex size-8 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

function getVisiblePageNumbers(page: number, totalPages: number): Array<number | "ellipsis"> {
  const delta = 1;
  const range: Array<number | "ellipsis"> = [];
  let lastShown = 0;

  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    const isEdge = candidate === 1 || candidate === totalPages;
    const isNearCurrent = Math.abs(candidate - page) <= delta;

    if (isEdge || isNearCurrent) {
      if (lastShown && candidate - lastShown > 1) {
        range.push("ellipsis");
      }

      range.push(candidate);
      lastShown = candidate;
    }
  }

  return range;
}
