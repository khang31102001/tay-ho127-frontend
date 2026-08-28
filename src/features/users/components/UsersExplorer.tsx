"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import type { ManagedUser } from "../types/user.types";

import { useUsersExplorer } from "../hooks/useUsersExplorer";

const columns: DataExplorerColumn<ManagedUser>[] = [
  { key: "fullName", header: "Họ tên" },
  { key: "email", header: "Email" },
  { key: "role", header: "Vai trò" },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function UsersExplorer() {
  const { users, isLoading, handleDelete } = useUsersExplorer();

  return (
    <DataExplorer<ManagedUser>
      title="Quản lý người dùng"
      columns={columns}
      rows={users}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.fullName} ${row.email} ${row.role}`}
      searchPlaceholder="Tìm người dùng..."
      createHref="/admin/users/new"
      createLabel="Thêm người dùng"
      editHref={(row) => `/admin/users/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có người dùng nào."
    />
  );
}
