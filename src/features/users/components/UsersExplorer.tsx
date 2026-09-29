"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge, statusFromIsActive } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import type { ManagedUser } from "../types/user.types";
import { useUsersExplorer } from "../hooks/useUsersExplorer";

const columns: DataExplorerColumn<ManagedUser>[] = [
  { key: "fullName", header: "Họ tên" },
  { key: "email", header: "Email" },
  {
    key: "createdAtUtc",
    header: "Ngày tạo",
    render: (row) => new Date(row.createdAtUtc).toLocaleDateString("vi-VN"),
  },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={statusFromIsActive(row.isActive)} inactiveLabel="Đã khóa" />,
  },
];

export function UsersExplorer() {
  const { users, isLoading, loadError } = useUsersExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedUser>
      title="Quản lý người dùng"
      columns={columns}
      rows={users}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.fullName} ${row.email}`}
      searchPlaceholder="Tìm theo họ tên hoặc email..."
      createHref={hasPermission("users.create") ? "/admin/users/new" : undefined}
      createLabel="Thêm người dùng"
      editHref={(row) => `/admin/users/${row.id}`}
      emptyState={loadError ?? "Chưa có người dùng nào."}
    />
  );
}
