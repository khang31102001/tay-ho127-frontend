"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";

import { usePaymentMethodsExplorer } from "../hooks/usePaymentMethodsExplorer";
import { PAYMENT_METHOD_GROUP_OPTIONS, type ManagedPaymentMethod } from "../types/payment-method.types";

const GROUP_LABEL = Object.fromEntries(
  PAYMENT_METHOD_GROUP_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const columns: DataExplorerColumn<ManagedPaymentMethod>[] = [
  { key: "displayOrder", header: "Thứ tự" },
  { key: "name", header: "Tên phương thức" },
  { key: "code", header: "Mã (code)" },
  {
    key: "group",
    header: "Nhóm",
    render: (row) => GROUP_LABEL[row.group] ?? row.group,
  },
  {
    key: "isDefault",
    header: "Mặc định",
    render: (row) => (row.isDefault ? "✓" : "—"),
  },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) => (
      <StatusBadge status={row.isActive ? "active" : "inactive"} activeLabel="Đang bật" inactiveLabel="Đang tắt" />
    ),
  },
];

/**
 * List/Create/Edit/Enable-Disable/Sort — Enable-Disable và Sort đều thực hiện
 * qua Editor (đổi isActive/displayOrder rồi Lưu), theo đúng convention hiện
 * tại của Banner/Menu (không có nút toggle/kéo-thả riêng trong danh sách).
 */
export function PaymentMethodsExplorer() {
  const { rows, isLoading, handleDelete } = usePaymentMethodsExplorer();

  return (
    <DataExplorer<ManagedPaymentMethod>
      title="Phương thức thanh toán"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code}`}
      searchPlaceholder="Tìm theo tên, mã..."
      createHref="/admin/settings/payment-methods/new"
      createLabel="Thêm phương thức"
      editHref={(row) => `/admin/settings/payment-methods/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có phương thức thanh toán nào."
    />
  );
}
