"use client";

import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { StatusPopup } from "@/components/shared/StatusPopup";
import { Pagination } from "@/components/ui/Pagination";

import { useDataExplorer } from "./useDataExplorer";

export type DataExplorerColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

export type DataExplorerProps<T> = {
  title: string;
  columns: DataExplorerColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  /**
   * Domain tự quyết định phần nào của bản ghi có thể tìm kiếm được.
   */
  getSearchableText: (row: T) => string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  createHref?: string;
  createLabel?: string;
  editHref?: (row: T) => string;
  onDelete?: (row: T) => Promise<void> | void;
  emptyState?: ReactNode;
  /** Nút/hành động phụ đặt cạnh nút "Thêm mới" (vd. Import/Export). Domain tự quyết định có hay không. */
  toolbarActions?: ReactNode;
  /** Số dòng/trang — không truyền = giữ nguyên hành vi cũ (hiện toàn bộ danh sách, không phân trang). */
  pageSize?: number;
  /** Từ khóa tìm kiếm ban đầu, dùng cho deep-link từ màn khác. */
  initialSearchTerm?: string;
};

/**
 * Template dùng chung cho mọi màn hình danh sách (Explore) trong Admin Portal.
 * Domain truyền config qua props — không chứa business logic của riêng domain nào.
 */
export function DataExplorer<T>({
  title,
  columns,
  rows,
  getRowId,
  getSearchableText,
  isLoading = false,
  searchPlaceholder = "Tìm kiếm...",
  createHref,
  createLabel = "Thêm mới",
  editHref,
  onDelete,
  emptyState,
  toolbarActions,
  pageSize,
  initialSearchTerm,
}: DataExplorerProps<T>) {
  const { searchTerm, setSearchTerm, filteredRows, paginatedRows, page, setPage } = useDataExplorer({
    rows,
    getSearchableText,
    pageSize,
    initialSearchTerm,
  });

  const visibleRows = pageSize ? paginatedRows : filteredRows;

  const [pendingDeleteRow, setPendingDeleteRow] = useState<T | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasRowActions = Boolean(editHref || onDelete);

  function closeDeletePopup() {
    setPendingDeleteRow(null);
    setDeleteError(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[20px] font-black text-brand-greenDark">{title}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {toolbarActions}

          {createHref && (
            <Link
              href={createHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-brand-redDark"
            >
              <Plus className="size-4" />
              {createLabel}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand-line bg-white px-4 py-2.5">
        <Search className="size-4 text-brand-muted" aria-hidden="true" />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full text-[14px] outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-brand-line bg-white">
        <table className="w-full min-w-[560px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-brand-line bg-brand-cream/40 text-brand-greenDark">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-bold ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}

              {hasRowActions && (
                <th className="px-4 py-3 text-right font-bold">Thao tác</th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (hasRowActions ? 1 : 0)}
                  className="px-4 py-10 text-center text-brand-muted"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasRowActions ? 1 : 0)}
                  className="px-4 py-10 text-center text-brand-muted"
                >
                  {emptyState ?? "Không có dữ liệu."}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-brand-line last:border-b-0"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 ${column.className ?? ""}`}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </td>
                  ))}

                  {hasRowActions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {editHref && (
                          <Link
                            href={editHref(row)}
                            aria-label="Sửa"
                            className="flex size-8 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark"
                          >
                            <Pencil className="size-4" />
                          </Link>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            aria-label="Xóa"
                            onClick={() => setPendingDeleteRow(row)}
                            className="flex size-8 items-center justify-center rounded-lg text-brand-muted transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize && filteredRows.length > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={filteredRows.length}
          onPageChange={setPage}
        />
      )}

      <StatusPopup
        open={pendingDeleteRow !== null}
        status={deleteError ? "error" : "warning"}
        title={deleteError ? "Không thể xóa." : "Xác nhận xóa?"}
        description={deleteError ?? "Hành động này không thể hoàn tác."}
        onOpenChange={(open) => {
          if (!open) {
            closeDeletePopup();
          }
        }}
        actions={
          deleteError
            ? [{ id: "close", label: "Đóng", variant: "secondary" }]
            : [
                { id: "cancel", label: "Hủy", variant: "secondary" },
                {
                  id: "confirm",
                  label: "Xóa",
                  variant: "danger",
                  onClick: () => {
                    if (pendingDeleteRow) {
                      return onDelete?.(pendingDeleteRow);
                    }
                  },
                },
              ]
        }
        onActionError={(error) => {
          setDeleteError(
            error instanceof Error ? error.message : "Vui lòng thử lại.",
          );
        }}
      />
    </div>
  );
}
