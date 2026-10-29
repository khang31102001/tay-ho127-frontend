"use client";

import {
  DataExplorer,
  DataExplorerFilterSelect,
  type DataExplorerColumn,
} from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/shared/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import { useCustomersExplorer, type CustomerStatusFilter } from "../hooks/useCustomersExplorer";
import type { ManagedCustomer } from "../types/customer.types";

const STATUS_FILTER_OPTIONS: { value: CustomerStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
];

const columns: DataExplorerColumn<ManagedCustomer>[] = [
  { key: "customerCode", header: "Mã KH" },
  { key: "fullName", header: "Họ tên" },
  { key: "phone", header: "Số điện thoại" },
  {
    key: "email",
    header: "Email",
    render: (row) => row.email ?? "—",
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function CustomersExplorer() {
  const { loadPage, statusFilter, setStatusFilter } = useCustomersExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedCustomer>
      title="Quản lý khách hàng"
      columns={columns}
      loadPage={loadPage}
      getRowId={(row) => row.id}
      searchPlaceholder="Tìm theo tên, SĐT, email..."
      createHref={hasPermission("customers.create") ? "/admin/sales/customers/new" : undefined}
      createLabel="Thêm khách hàng"
      editHref={(row) => `/admin/sales/customers/${row.id}`}
      emptyState="Chưa có khách hàng nào."
      totalLabel="khách hàng"
      filters={
        <DataExplorerFilterSelect
          ariaLabel="Lọc theo trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
        />
      }
    />
  );
}
