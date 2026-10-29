"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

import { adminButtonClassName, adminMenuItemClassName } from "../templates/formFieldClassName";

import { buildCsv, downloadCsv } from "./csv";
import type { ExportColumn } from "./import-export.types";

type ExportButtonProps<T> = {
  label?: string;
  fileName: string;
  columns: ExportColumn<T>[];
  rows: T[];
  /** "menu-item" khi đặt trong menu "Tiện ích" của DataExplorer. */
  appearance?: "button" | "menu-item";
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
  appearance = "button",
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
      className={appearance === "menu-item" ? adminMenuItemClassName : adminButtonClassName.outline}
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
