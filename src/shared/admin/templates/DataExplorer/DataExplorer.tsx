"use client";

import { useState, type ReactNode } from "react";

import { StatusPopup } from "@/shared/components/StatusPopup";

import type { DataExplorerColumn, DataExplorerLoadPage } from "./data-explorer.types";
import { DataExplorerTable } from "./DataExplorerTable";
import { DataExplorerToolbar } from "./DataExplorerToolbar";
import { useDataExplorer } from "./useDataExplorer";

export type {
  DataExplorerColumn,
  DataExplorerLoadPage,
  DataExplorerPage,
  DataExplorerPageQuery,
} from "./data-explorer.types";
export { DataExplorerFilterSelect } from "./DataExplorerToolbar";

export type DataExplorerProps<T> = {
  title: string;
  columns: DataExplorerColumn<T>[];
  getRowId: (row: T) => string | number;
  /**
   * Chế độ client (mặc định): toàn bộ dữ liệu đã tải sẵn; template tìm kiếm bỏ dấu, sắp xếp cột và hiển thị dần
   * 10 dòng khi cuộn. Dùng cho danh mục cấu hình, dữ liệu dạng cây, màn có Import/Export cần đủ dữ liệu.
   */
  rows?: T[];
  /** Domain tự quyết định phần nào của bản ghi có thể tìm kiếm được (chế độ client). */
  getSearchableText?: (row: T) => string;
  /**
   * Chế độ server: infinite scroll 10 bản ghi/request, tìm kiếm do Backend xử lý (`search` của PagedRequest).
   * Bọc bằng useCallback theo bộ lọc — đổi bộ lọc = đổi identity = tải lại từ trang 1.
   */
  loadPage?: DataExplorerLoadPage<T>;
  /** Chế độ client: đang tải dữ liệu lần đầu. */
  isLoading?: boolean;
  /** Chế độ client: lỗi tải dữ liệu (hiện kèm nút "Thử lại"). */
  loadError?: string | null;
  /** Chế độ client: tải lại khi bấm "Thử lại" — không truyền thì tải lại trang. */
  onRetry?: () => void;
  searchPlaceholder?: string;
  createHref?: string;
  createLabel?: string;
  editHref?: (row: T) => string;
  onDelete?: (row: T) => Promise<void> | void;
  /** Nội dung khi không có dữ liệu (chưa tìm kiếm). */
  emptyState?: ReactNode;
  /** Dropdown lọc nhanh trên toolbar (nên dùng DataExplorerFilterSelect). */
  filters?: ReactNode;
  /** Bộ lọc chi tiết — hiện nút "Nâng cao" mở/đóng khung này. */
  advancedFilters?: ReactNode;
  /** Hành động nhanh đặt cạnh bộ lọc (nút riêng của module). */
  toolbarActions?: ReactNode;
  /** Các mục của menu "Tiện ích" (vd. Xuất/Nhập file với appearance="menu-item"). */
  utilities?: ReactNode;
  /** Hành động hàng loạt trên các dòng đã chọn — có prop này mới hiện cột checkbox. */
  bulkActions?: (selectedRows: T[], clearSelection: () => void) => ReactNode;
  /** Đơn vị ở chân bảng: "Tổng: 81 {totalLabel}". */
  totalLabel?: string;
  /** Từ khóa tìm kiếm ban đầu, dùng cho deep-link từ màn khác. */
  initialSearchTerm?: string;
};

/**
 * Template dùng chung cho mọi màn hình danh sách (Explore) trong Admin Portal, giao diện ERP/POS.
 * Domain truyền config qua props — không chứa business logic của riêng domain nào.
 */
export function DataExplorer<T>({
  title,
  columns,
  getRowId,
  rows,
  getSearchableText,
  loadPage,
  isLoading = false,
  loadError = null,
  onRetry,
  searchPlaceholder = "Tìm kiếm...",
  createHref,
  createLabel = "Thêm mới",
  editHref,
  onDelete,
  emptyState,
  filters,
  advancedFilters,
  toolbarActions,
  utilities,
  bulkActions,
  totalLabel = "bản ghi",
  initialSearchTerm,
}: DataExplorerProps<T>) {
  const explorer = useDataExplorer({
    columns,
    getRowId,
    rows,
    getSearchableText,
    loadPage,
    initialSearchTerm,
  });

  const [pendingDeleteRow, setPendingDeleteRow] = useState<T | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isInitialLoading = explorer.isServerMode ? explorer.isInitialLoading : isLoading;
  const initialError = explorer.isServerMode ? explorer.initialError : isLoading ? null : loadError;
  const hasSearch = explorer.appliedSearch.length > 0;
  const showTotal = !isInitialLoading && !initialError;

  function retryInitial() {
    if (explorer.isServerMode) explorer.retry();
    else if (onRetry) onRetry();
    else window.location.reload();
  }

  function closeDeletePopup() {
    setPendingDeleteRow(null);
    setDeleteError(null);
  }

  async function confirmDelete(row: T) {
    await onDelete?.(row);
    // Chế độ client: module tự tải lại `rows`; chế độ server: template nắm dữ liệu nên tự tải lại từ đầu.
    if (explorer.isServerMode) await explorer.reload();
  }

  return (
    <div>
      <h1 className="mb-4 text-admin-title font-bold text-admin-text">{title}</h1>

      <DataExplorerToolbar
        searchTerm={explorer.searchTerm}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={explorer.setSearchTerm}
        onSearchSubmit={explorer.submitSearch}
        filters={filters}
        advancedFilters={advancedFilters}
        quickActions={toolbarActions}
        utilities={utilities}
        createHref={createHref}
        createLabel={createLabel}
      />

      {bulkActions && explorer.selectedRows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-admin border border-admin-primaryBorder bg-admin-primaryLight px-3 py-2 text-admin-sm text-admin-text">
          <span className="font-semibold">Đã chọn {explorer.selectedRows.length}</span>
          {bulkActions(explorer.selectedRows, explorer.clearSelection)}
          <button
            type="button"
            onClick={explorer.clearSelection}
            className="ml-auto font-semibold text-admin-primary hover:underline"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="mt-4">
        <DataExplorerTable<T>
          columns={columns}
          rows={explorer.visibleRows}
          getRowId={getRowId}
          isInitialLoading={isInitialLoading}
          initialError={initialError}
          onRetryInitial={retryInitial}
          isLoadingMore={explorer.isLoadingMore}
          loadMoreError={explorer.loadMoreError}
          onRetryLoadMore={explorer.retry}
          hasMore={explorer.hasMore}
          onLoadMore={explorer.loadMore}
          emptyContent={hasSearch ? "Không tìm thấy kết quả phù hợp." : emptyState ?? "Không có dữ liệu."}
          sort={explorer.sort}
          isColumnSortable={explorer.isColumnSortable}
          onToggleSort={explorer.toggleSort}
          isSelectable={Boolean(bulkActions)}
          selectedIds={explorer.selectedIds}
          isAllVisibleSelected={explorer.isAllVisibleSelected}
          isSomeVisibleSelected={explorer.isSomeVisibleSelected}
          onToggleRow={explorer.toggleRowSelection}
          onToggleVisible={explorer.toggleVisibleSelection}
          editHref={editHref}
          onRequestDelete={onDelete ? setPendingDeleteRow : undefined}
        />
      </div>

      <div className="flex min-h-12 items-center justify-end border-b border-admin-border px-3 py-3 text-admin-lg text-admin-text">
        {showTotal && (
          <span aria-live="polite">
            {/* Server không trả tổng (vd. lọc thêm phía client) thì báo số đã tải thay vì đoán tổng. */}
            {explorer.totalItems === null
              ? `Đã tải: ${explorer.visibleRows.length.toLocaleString("vi-VN")} ${totalLabel}`
              : `Tổng: ${explorer.totalItems.toLocaleString("vi-VN")} ${totalLabel}`}
          </span>
        )}
      </div>

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
                      return confirmDelete(pendingDeleteRow);
                    }
                  },
                },
              ]
        }
        onActionError={(error) => {
          setDeleteError(error instanceof Error ? error.message : "Vui lòng thử lại.");
        }}
      />
    </div>
  );
}
