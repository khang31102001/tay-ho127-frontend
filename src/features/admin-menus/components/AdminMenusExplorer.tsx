"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge, statusFromIsActive } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import { useAdminMenusExplorer, type AdminMenuRow } from "../hooks/useAdminMenusExplorer";

const columns: DataExplorerColumn<AdminMenuRow>[] = [
  {
    key: "name",
    header: "Tên menu",
    render: (row) => (row.parentId ? <span className="pl-5">↳ {row.name}</span> : <strong>{row.name}</strong>),
  },
  { key: "route", header: "Đường dẫn", render: (row) => row.route ?? "(nhóm)" },
  { key: "code", header: "Mã", className: "font-mono text-[12px]" },
  { key: "sortOrder", header: "Thứ tự" },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={statusFromIsActive(row.isActive)} />,
  },
];

export function AdminMenusExplorer() {
  const { rows, isLoading, loadError, handleDelete } = useAdminMenusExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<AdminMenuRow>
      title="Menu quản trị"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code} ${row.route ?? ""} ${row.parentName}`}
      searchPlaceholder="Tìm theo tên, mã, đường dẫn..."
      createHref={hasPermission("menus.create") ? "/admin/system/menus/new" : undefined}
      createLabel="Thêm menu"
      editHref={(row) => `/admin/system/menus/${row.id}`}
      onDelete={hasPermission("menus.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có menu nào."}
    />
  );
}
