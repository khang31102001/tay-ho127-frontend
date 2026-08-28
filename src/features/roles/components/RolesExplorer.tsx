"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { PERMISSION_OPTIONS, type ManagedRole } from "../types/role.types";

import { useRolesExplorer } from "../hooks/useRolesExplorer";

const columns: DataExplorerColumn<ManagedRole>[] = [
  { key: "name", header: "Tên vai trò" },
  {
    key: "permissions",
    header: "Quyền",
    render: (row) => `${row.permissions.length}/${PERMISSION_OPTIONS.length} quyền`,
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function RolesExplorer() {
  const { roles, isLoading, handleDelete } = useRolesExplorer();

  return (
    <DataExplorer<ManagedRole>
      title="Quản lý vai trò"
      columns={columns}
      rows={roles}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.description ?? ""}`}
      searchPlaceholder="Tìm vai trò..."
      createHref="/admin/roles/new"
      createLabel="Thêm vai trò"
      editHref={(row) => `/admin/roles/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có vai trò nào."
    />
  );
}
