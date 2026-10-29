"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, LoaderCircle, Pencil, RotateCw, Trash2 } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import type { DataExplorerColumn, DataExplorerColumnAlign, DataExplorerSort } from "./data-explorer.types";
import { DATA_EXPLORER_BATCH_SIZE } from "./useDataExplorer";

const ALIGN_CLASS: Record<DataExplorerColumnAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const SKELETON_ROW_COUNT = 6;

/** Bắt đầu tải thêm khi sentinel còn cách đáy vùng cuộn ~1 màn nhỏ — người dùng gần như không phải chờ. */
const SENTINEL_ROOT_MARGIN = "0px 0px 160px 0px";

type DataExplorerTableProps<T> = {
  columns: DataExplorerColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  isInitialLoading: boolean;
  initialError: string | null;
  onRetryInitial: () => void;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  onRetryLoadMore: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
  emptyContent: ReactNode;
  sort: DataExplorerSort | null;
  isColumnSortable: (column: DataExplorerColumn<T>) => boolean;
  onToggleSort: (key: string) => void;
  isSelectable: boolean;
  selectedIds: Set<string | number>;
  isAllVisibleSelected: boolean;
  isSomeVisibleSelected: boolean;
  onToggleRow: (row: T) => void;
  onToggleVisible: () => void;
  editHref?: (row: T) => string;
  onRequestDelete?: (row: T) => void;
};

/**
 * Bảng dữ liệu kiểu ERP: header nền xám chữ đậm (dính đầu khi cuộn), cột chọn + cột #, viền ngang mảnh,
 * hover nền xanh nhạt, dòng đã chọn có màu riêng, cột thao tác dính phải khi cuộn ngang.
 * Cuộn dọc bên trong khung; sentinel cuối bảng báo "cần tải thêm" qua IntersectionObserver.
 */
export function DataExplorerTable<T>({
  columns,
  rows,
  getRowId,
  isInitialLoading,
  initialError,
  onRetryInitial,
  isLoadingMore,
  loadMoreError,
  onRetryLoadMore,
  hasMore,
  onLoadMore,
  emptyContent,
  sort,
  isColumnSortable,
  onToggleSort,
  isSelectable,
  selectedIds,
  isAllVisibleSelected,
  isSomeVisibleSelected,
  onToggleRow,
  onToggleVisible,
  editHref,
  onRequestDelete,
}: DataExplorerTableProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const hasRowActions = Boolean(editHref || onRequestDelete);
  const columnCount = columns.length + 1 + (isSelectable ? 1 : 0) + (hasRowActions ? 1 : 0);
  const canObserve = hasMore && !isInitialLoading && !isLoadingMore && !loadMoreError && !initialError;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeVisibleSelected;
  }, [isSomeVisibleSelected]);

  // Tạo lại observer mỗi khi số dòng đổi: observe() bắn ngay 1 lần, nên nếu sentinel vẫn còn trong khung
  // (trang vừa tải quá ngắn để lấp đầy) thì tự tải tiếp mà không cần người dùng cuộn.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!canObserve || !sentinel || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root: scrollContainerRef.current, rootMargin: SENTINEL_ROOT_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canObserve, onLoadMore, rows.length]);

  function renderBodyState(content: ReactNode) {
    return (
      <tr>
        <td colSpan={columnCount} className="px-4 py-12 text-center text-admin-textSecondary">
          {content}
        </td>
      </tr>
    );
  }

  function renderBody() {
    if (isInitialLoading) {
      return Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <tr key={`skeleton-${index}`} className="border-b border-admin-border" aria-hidden="true">
          {Array.from({ length: columnCount }, (_, cellIndex) => (
            <td key={cellIndex} className="h-admin-row px-3">
              <span className="block h-3.5 w-full max-w-[140px] animate-pulse rounded bg-admin-tableHeader" />
            </td>
          ))}
        </tr>
      ));
    }

    if (initialError) {
      return renderBodyState(
        <div role="alert" className="flex flex-col items-center gap-3">
          <span className="text-admin-dangerText">{initialError}</span>
          <RetryButton onClick={onRetryInitial} />
        </div>,
      );
    }

    if (rows.length === 0) return renderBodyState(emptyContent);

    return rows.map((row, index) => {
      const rowId = getRowId(row);
      const isSelected = selectedIds.has(rowId);

      return (
        <tr
          key={rowId}
          aria-selected={isSelectable ? isSelected : undefined}
          className={`group border-b border-admin-border transition-colors duration-admin hover:bg-admin-primaryLight ${
            isSelected ? "bg-admin-rowSelected shadow-[inset_3px_0_0_rgb(var(--admin-primary-rgb))]" : "bg-admin-surface"
          }`}
        >
          {isSelectable && (
            <td className="w-10 px-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleRow(row)}
                aria-label={`Chọn dòng ${index + 1}`}
                className="size-4 cursor-pointer accent-admin-primary"
              />
            </td>
          )}

          <td className="w-12 px-3 text-admin-textSecondary">{index + 1}</td>

          {columns.map((column) => (
            <td
              key={column.key}
              className={`h-admin-row px-3 py-2 ${ALIGN_CLASS[column.align ?? "left"]} ${column.className ?? ""}`}
            >
              {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
            </td>
          ))}

          {hasRowActions && (
            // Dính phải + nền kế thừa dòng: thao tác luôn thấy được khi bảng cuộn ngang.
            <td className="sticky right-0 bg-inherit px-3 py-2 text-right shadow-[inset_1px_0_0_rgb(var(--admin-border-rgb))]">
              <div className="flex justify-end gap-1">
                {editHref && (
                  <Link
                    href={editHref(row)}
                    aria-label="Sửa"
                    title="Sửa"
                    className="flex size-8 items-center justify-center rounded-admin text-admin-primary outline-none transition-colors duration-admin hover:bg-admin-primary/10 focus-visible:ring-2 focus-visible:ring-admin-focus/50"
                  >
                    <Pencil className="size-4" />
                  </Link>
                )}

                {onRequestDelete && (
                  <button
                    type="button"
                    aria-label="Xóa"
                    title="Xóa"
                    onClick={() => onRequestDelete(row)}
                    className="flex size-8 items-center justify-center rounded-admin text-admin-muted outline-none transition-colors duration-admin hover:bg-admin-danger/10 hover:text-admin-danger focus-visible:ring-2 focus-visible:ring-admin-focus/50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </td>
          )}
        </tr>
      );
    });
  }

  const showFooterStatus =
    !isInitialLoading &&
    !initialError &&
    rows.length > 0 &&
    (hasMore || isLoadingMore || Boolean(loadMoreError) || rows.length > DATA_EXPLORER_BATCH_SIZE);

  return (
    <div
      ref={scrollContainerRef}
      className="max-h-[calc(100svh-15rem)] min-h-[240px] overflow-auto border-y border-admin-border bg-admin-surface"
    >
      <table className="w-full min-w-[720px] border-collapse text-admin-base text-admin-text">
        <thead className="sticky top-0 z-10 bg-admin-tableHeader">
          <tr className="border-b border-admin-border">
            {isSelectable && (
              <th scope="col" className="w-10 px-3 py-3 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={isAllVisibleSelected}
                  onChange={onToggleVisible}
                  disabled={rows.length === 0}
                  aria-label="Chọn tất cả dòng đang hiển thị"
                  className="size-4 cursor-pointer accent-admin-primary"
                />
              </th>
            )}

            <th scope="col" className="w-12 px-3 py-3 text-left font-bold">
              #
            </th>

            {columns.map((column) => (
              <HeaderCell
                key={column.key}
                column={column}
                isSortable={isColumnSortable(column)}
                sort={sort}
                onToggleSort={onToggleSort}
              />
            ))}

            {hasRowActions && (
              <th scope="col" className="sticky right-0 bg-admin-tableHeader px-3 py-3 text-right font-bold">
                Thao tác
              </th>
            )}
          </tr>
        </thead>

        <tbody>{renderBody()}</tbody>
      </table>

      {showFooterStatus && (
        <div className="flex min-h-12 items-center justify-center px-4 py-3 text-admin-sm text-admin-textSecondary">
          {isLoadingMore && (
            <span className="inline-flex items-center gap-2" role="status">
              <LoaderCircle className="size-4 animate-spin text-admin-primary" aria-hidden="true" />
              Đang tải thêm...
            </span>
          )}

          {loadMoreError && (
            <span role="alert" className="inline-flex flex-wrap items-center justify-center gap-3">
              <span className="text-admin-dangerText">{loadMoreError}</span>
              <RetryButton onClick={onRetryLoadMore} />
            </span>
          )}

          {/* Danh sách ngắn (1 lượt) không cần báo "hết" — chỉ báo khi người dùng đã cuộn tải thêm. */}
          {!hasMore && !isLoadingMore && !loadMoreError && rows.length > DATA_EXPLORER_BATCH_SIZE && (
            <span>Đã hiển thị toàn bộ dữ liệu.</span>
          )}
        </div>
      )}

      {/* Sentinel: lọt vào khung cuộn => tải thêm 10 dòng. */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
    </div>
  );
}

function HeaderCell<T>({
  column,
  isSortable,
  sort,
  onToggleSort,
}: {
  column: DataExplorerColumn<T>;
  isSortable: boolean;
  sort: DataExplorerSort | null;
  onToggleSort: (key: string) => void;
}) {
  const alignClass = ALIGN_CLASS[column.align ?? "left"];
  const direction = sort?.key === column.key ? sort.direction : null;

  if (!isSortable) {
    return (
      <th scope="col" className={`whitespace-nowrap px-3 py-3 font-bold ${alignClass} ${column.className ?? ""}`}>
        {column.header}
      </th>
    );
  }

  const SortIcon = direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <th
      scope="col"
      aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
      className={`whitespace-nowrap px-3 py-3 font-bold ${alignClass} ${column.className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => onToggleSort(column.key)}
        className={`inline-flex items-center gap-1 rounded-admin font-bold outline-none focus-visible:ring-2 focus-visible:ring-admin-focus/50 ${
          column.align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        {column.header}
        <SortIcon
          className={`size-3.5 ${direction ? "text-admin-primary" : "text-admin-muted"}`}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-admin border border-admin-primary px-3 text-admin-sm font-semibold text-admin-primary transition-colors duration-admin hover:bg-admin-primaryLight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-focus/50"
    >
      <RotateCw className="size-3.5" aria-hidden="true" />
      Thử lại
    </button>
  );
}
