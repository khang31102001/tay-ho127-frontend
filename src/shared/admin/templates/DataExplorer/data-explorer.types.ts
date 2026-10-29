import type { ReactNode } from "react";

export type DataExplorerColumnAlign = "left" | "center" | "right";

export type DataExplorerColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  /** Class áp cho cả ô header và ô dữ liệu (vd. độ rộng). */
  className?: string;
  /** Số tiền/số lượng căn phải để dễ so sánh theo hàng đơn vị. */
  align?: DataExplorerColumnAlign;
  /**
   * Giá trị dùng để sắp xếp (chế độ `rows`). Không truyền thì dùng `row[key]` nếu là chuỗi/số/boolean;
   * cột không có giá trị nguyên thủy (ảnh, nút...) tự không sắp xếp được.
   */
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  /** `false` để tắt sắp xếp cột dù có giá trị. */
  sortable?: boolean;
};

export type DataExplorerSortDirection = "asc" | "desc";

export type DataExplorerSort = { key: string; direction: DataExplorerSortDirection };

/** Tham số 1 lượt tải trang (chế độ `loadPage`) — map thẳng sang PagedRequest của Backend (page, pageSize, search). */
export type DataExplorerPageQuery = {
  page: number;
  pageSize: number;
  search: string;
};

export type DataExplorerPage<T> = {
  items: T[];
  /** Tổng số bản ghi khớp điều kiện (PagedResult.totalItems); không biết được thì bỏ trống. */
  totalItems?: number;
  /**
   * Còn trang sau hay không. Bỏ trống thì template tự suy ra từ `totalItems` và số dòng trả về
   * (trang trả về ít hơn pageSize = trang cuối).
   */
  hasMore?: boolean;
};

/**
 * Tải 1 trang từ server. Template hủy `signal` khi từ khóa đổi hoặc khi hàm này đổi identity
 * (module bọc bằng useCallback theo bộ lọc => đổi bộ lọc là tải lại từ trang 1).
 */
export type DataExplorerLoadPage<T> = (query: DataExplorerPageQuery, signal: AbortSignal) => Promise<DataExplorerPage<T>>;
