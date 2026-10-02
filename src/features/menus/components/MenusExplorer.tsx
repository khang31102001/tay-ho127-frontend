"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import type { ManagedMenu } from "../types/menu.types";

import { useMenusExplorer } from "../hooks/useMenusExplorer";

const columns: DataExplorerColumn<ManagedMenu>[] = [
  { key: "name", header: "Tên thực đơn" },
  { key: "code", header: "Mã" },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function MenusExplorer() {
  const { menus, isLoading, loadError, handleDelete } = useMenusExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedMenu>
      title="Quản lý thực đơn (Catalog)"
      columns={columns}
      rows={menus}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code}`}
      searchPlaceholder="Tìm thực đơn..."
      createHref={hasPermission("sales-menus.create") ? "/admin/catalog/menus/new" : undefined}
      createLabel="Thêm thực đơn"
      editHref={(row) => `/admin/catalog/menus/${row.id}`}
      onDelete={hasPermission("sales-menus.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có thực đơn nào."}
    />
  );
}
