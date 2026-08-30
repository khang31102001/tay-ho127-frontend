import { CheckCircle2, XCircle } from "lucide-react";

import type { ImportColumn, ImportRowResult } from "./import-export.types";

type ImportPreviewTableProps<T> = {
  columns: ImportColumn<T>[];
  results: ImportRowResult<T>[];
};

export function ImportPreviewTable<T>({ columns, results }: ImportPreviewTableProps<T>) {
  return (
    <div className="max-h-80 overflow-auto rounded-lg border border-brand-line">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead className="sticky top-0 bg-brand-cream/60">
          <tr className="border-b border-brand-line text-brand-greenDark">
            <th className="px-3 py-2 font-bold">#</th>
            <th className="px-3 py-2 font-bold">Trạng thái</th>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-bold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr
              key={result.rowIndex}
              className={`border-b border-brand-line last:border-b-0 ${
                result.status === "invalid" ? "bg-red-50" : ""
              }`}
            >
              <td className="px-3 py-2 text-brand-muted">{result.rowIndex + 1}</td>

              <td className="px-3 py-2">
                {result.status === "valid" ? (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-brand-greenDark">
                    <CheckCircle2 className="size-4 shrink-0" />
                    Hợp lệ
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-red-600"
                    title={result.errors.join("; ")}
                  >
                    <XCircle className="size-4 shrink-0" />
                    {result.errors[0]}
                  </span>
                )}
              </td>

              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2">
                  {result.raw[column.header] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
