"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";

import { useCustomersExplorer, type CustomerStatusFilter } from "../hooks/useCustomersExplorer";
import type { ManagedCustomer } from "../types/customer.types";

const STATUS_FILTER_OPTIONS: { value: CustomerStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
];

const PAGE_SIZE = 10;

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
  const { rows, statusFilter, setStatusFilter, isLoading, handleDelete } = useCustomersExplorer();

  return (
    <DataExplorer<ManagedCustomer>
      title="Quản lý khách hàng"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      pageSize={PAGE_SIZE}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.fullName} ${row.phone} ${row.email ?? ""} ${row.customerCode}`}
      searchPlaceholder="Tìm theo tên, SĐT, email..."
      createHref="/admin/sales/customers/new"
      createLabel="Thêm khách hàng"
      editHref={(row) => `/admin/sales/customers/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có khách hàng nào."
      toolbarActions={
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as CustomerStatusFilter)}
          className="h-10 rounded-lg border border-brand-line px-3 text-[13px] font-bold text-brand-greenDark outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    />
  );
}
