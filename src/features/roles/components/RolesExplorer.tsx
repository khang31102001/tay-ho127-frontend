"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge, statusFromIsActive } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import type { ManagedRole } from "../types/role.types";
import { useRolesExplorer } from "../hooks/useRolesExplorer";

const columns: DataExplorerColumn<ManagedRole>[] = [
  { key: "name", header: "Tên vai trò" },
  { key: "code", header: "Mã", className: "font-mono text-[13px]" },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={statusFromIsActive(row.isActive)} />,
  },
];

export function RolesExplorer() {
  const { roles, isLoading, loadError, handleDelete } = useRolesExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedRole>
      title="Quản lý vai trò"
      columns={columns}
      rows={roles}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code}`}
      searchPlaceholder="Tìm vai trò..."
      createHref={hasPermission("roles.create") ? "/admin/roles/new" : undefined}
      createLabel="Thêm vai trò"
      editHref={(row) => `/admin/roles/${row.id}`}
      onDelete={hasPermission("roles.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có vai trò nào."}
    />
  );
}
