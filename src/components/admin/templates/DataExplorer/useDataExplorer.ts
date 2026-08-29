"use client";

import { useMemo, useState } from "react";

import { normalizeText } from "@/lib/normalize-text";

type UseDataExplorerParams<T> = {
  rows: T[];
  /**
   * Domain tự quyết định phần nào của bản ghi có thể tìm kiếm được
   * (ví dụ: tên + danh mục). Template không đoán field.
   */
  getSearchableText: (row: T) => string;
  /**
   * Số dòng/trang — không truyền = giữ nguyên hành vi cũ (hiện toàn bộ
   * filteredRows, không phân trang). Chỉ domain có danh sách dài (Customer,
   * Order...) mới cần truyền.
   */
  pageSize?: number;
  /**
   * Giá trị tìm kiếm ban đầu — dùng khi màn khác deep-link vào Explorer kèm
   * từ khóa (ví dụ Order Detail link sang Payment List theo mã đơn).
   */
  initialSearchTerm?: string;
};

export function useDataExplorer<T>({
  rows,
  getSearchableText,
  pageSize,
  initialSearchTerm = "",
}: UseDataExplorerParams<T>) {
  const [searchTerm, setSearchTermState] = useState(initialSearchTerm);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm);

    if (!normalizedSearchTerm) {
      return rows;
    }

    return rows.filter((row) =>
      normalizeText(getSearchableText(row)).includes(normalizedSearchTerm),
    );
  }, [rows, searchTerm, getSearchableText]);

  // Đổi từ khóa tìm kiếm thì quay lại trang 1 — tránh đứng ở trang trống.
  function setSearchTerm(value: string) {
    setSearchTermState(value);
    setPage(1);
  }

  const paginatedRows = useMemo(() => {
    if (!pageSize) {
      return filteredRows;
    }

    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  return {
    searchTerm,
    setSearchTerm,
    filteredRows,
    paginatedRows,
    page,
    setPage,
  };
}
