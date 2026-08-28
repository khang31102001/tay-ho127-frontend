"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import type { ManagedMenu } from "../types/menu.types";

import { useMenusExplorer } from "../hooks/useMenusExplorer";

const columns: DataExplorerColumn<ManagedMenu>[] = [
  { key: "name", header: "Tên thực đơn" },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function MenusExplorer() {
  const { menus, isLoading, handleDelete } = useMenusExplorer();

  return (
    <DataExplorer<ManagedMenu>
      title="Quản lý thực đơn (Catalog)"
      columns={columns}
      rows={menus}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => row.name}
      searchPlaceholder="Tìm thực đơn..."
      createHref="/admin/catalog/menus/new"
      createLabel="Thêm thực đơn"
      editHref={(row) => `/admin/catalog/menus/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có thực đơn nào."
    />
  );
}
