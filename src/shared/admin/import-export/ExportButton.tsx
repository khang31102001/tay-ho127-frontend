"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

import { buildCsv, downloadCsv } from "./csv";
import type { ExportColumn } from "./import-export.types";

type ExportButtonProps<T> = {
  label?: string;
  fileName: string;
  columns: ExportColumn<T>[];
  rows: T[];
};

/**
 * Nút Export dùng chung cho mọi màn Admin — chỉ cần truyền columns/rows,
 * không biết gì về domain cụ thể. Xuất CSV ngay trên trình duyệt, không gọi API.
 */
export function ExportButton<T>({
  label = "Xuất file",
  fileName,
  columns,
  rows,
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  function handleExport() {
    setIsExporting(true);

    try {
      const headers = columns.map((column) => column.header);
      const csvRows = rows.map((row) =>
        columns.map((column) =>
          column.format
            ? column.format(row)
            : String((row as Record<string, unknown>)[column.key] ?? ""),
        ),
      );

      downloadCsv(fileName, buildCsv(headers, csvRows));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || rows.length === 0}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-white px-4 py-2.5 text-[14px] font-bold text-brand-greenDark transition hover:bg-brand-green/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isExporting ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {label}
    </button>
  );
}
