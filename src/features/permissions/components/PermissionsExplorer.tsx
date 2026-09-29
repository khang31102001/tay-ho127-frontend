"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge, statusFromIsActive } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import type { ManagedPermission } from "../types/permission.types";
import { usePermissionsExplorer } from "../hooks/usePermissionsExplorer";

const columns: DataExplorerColumn<ManagedPermission>[] = [
  { key: "code", header: "Mã quyền", className: "font-mono text-[13px]" },
  { key: "name", header: "Mô tả" },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={statusFromIsActive(row.isActive)} />,
  },
];

export function PermissionsExplorer() {
  const { permissions, isLoading, loadError, handleDelete } = usePermissionsExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedPermission>
      title="Quản lý quyền"
      columns={columns}
      rows={permissions}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.code} ${row.name}`}
      searchPlaceholder="Tìm theo mã hoặc mô tả..."
      createHref={hasPermission("permissions.create") ? "/admin/permissions/new" : undefined}
      createLabel="Thêm quyền"
      editHref={(row) => `/admin/permissions/${row.id}`}
      onDelete={hasPermission("permissions.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có quyền nào."}
    />
  );
}
