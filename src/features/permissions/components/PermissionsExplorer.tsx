"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge, statusFromIsActive } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import { usePermissionsExplorer } from "../hooks/usePermissionsExplorer";
import type { PermissionRow } from "../utils/permission-tree";

const INDENT_PX_PER_LEVEL = 20;

const columns: DataExplorerColumn<PermissionRow>[] = [
  {
    key: "name",
    header: "Nhóm / Quyền",
    render: (row) => (
      <span
        style={{ paddingLeft: row.depth * INDENT_PX_PER_LEVEL }}
        className={row.isGroup ? "font-bold text-brand-greenDark" : undefined}
      >
        {row.name}
      </span>
    ),
  },
  { key: "code", header: "Mã", className: "font-mono text-[13px]" },
  {
    key: "isGroup",
    header: "Loại",
    render: (row) => (row.isGroup ? "Nhóm" : "Quyền"),
  },
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
    <DataExplorer<PermissionRow>
      title="Quản lý quyền"
      columns={columns}
      rows={permissions}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.code} ${row.name} ${row.parentName ?? ""}`}
      searchPlaceholder="Tìm theo mã, tên hoặc nhóm..."
      createHref={hasPermission("permissions.create") ? "/admin/permissions/new" : undefined}
      createLabel="Thêm quyền / nhóm"
      editHref={(row) => `/admin/permissions/${row.id}`}
      onDelete={hasPermission("permissions.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có quyền nào."}
    />
  );
}
