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
};

export function useDataExplorer<T>({ rows, getSearchableText }: UseDataExplorerParams<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm);

    if (!normalizedSearchTerm) {
      return rows;
    }

    return rows.filter((row) =>
      normalizeText(getSearchableText(row)).includes(normalizedSearchTerm),
    );
  }, [rows, searchTerm, getSearchableText]);

  return {
    searchTerm,
    setSearchTerm,
    filteredRows,
  };
}
