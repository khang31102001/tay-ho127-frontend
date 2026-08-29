"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { PublishStatusBadge } from "@/components/shared/PublishStatusBadge";

import { usePagesExplorer } from "../hooks/usePagesExplorer";
import type { ManagedPage } from "../types/page.types";

const columns: DataExplorerColumn<ManagedPage>[] = [
  { key: "name", header: "Tên page" },
  { key: "slug", header: "Đường dẫn" },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <PublishStatusBadge status={row.status} />,
  },
];

export function PagesExplorer() {
  const { rows, isLoading, handleDelete } = usePagesExplorer();

  return (
    <DataExplorer<ManagedPage>
      title="Quản lý Page"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.slug}`}
      searchPlaceholder="Tìm page..."
      createHref="/admin/content/pages/new"
      createLabel="Thêm page"
      editHref={(row) => `/admin/content/pages/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có page nào."
    />
  );
}
