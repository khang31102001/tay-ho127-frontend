"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";

import type { ManagedRedirect } from "../types/redirect.types";
import { useRedirectsExplorer } from "../hooks/useRedirectsExplorer";

const columns: DataExplorerColumn<ManagedRedirect>[] = [
  { key: "sourcePath", header: "Source path" },
  { key: "destinationUrl", header: "Destination" },
  {
    key: "redirectType",
    header: "Loại",
    render: (row) => (
      <span
        className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${
          row.redirectType === 301 ? "bg-brand-green/10 text-brand-greenDark" : "bg-amber-100 text-amber-700"
        }`}
      >
        {row.redirectType}
      </span>
    ),
  },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) =>
      row.isActive ? (
        <span className="text-brand-greenDark">Đang hoạt động</span>
      ) : (
        <span className="text-brand-muted">Tạm tắt</span>
      ),
  },
];

export function RedirectsExplorer() {
  const { redirects, isLoading, handleDelete } = useRedirectsExplorer();

  return (
    <DataExplorer<ManagedRedirect>
      title="Chuyển hướng (Redirects)"
      columns={columns}
      rows={redirects}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.sourcePath} ${row.destinationUrl}`}
      searchPlaceholder="Tìm theo source path, destination..."
      createHref="/admin/seo/redirects/new"
      createLabel="Thêm redirect"
      editHref={(row) => `/admin/seo/redirects/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có redirect nào."
    />
  );
}
