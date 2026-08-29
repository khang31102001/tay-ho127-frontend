"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";

import { useDeliveryMethodsExplorer } from "../hooks/useDeliveryMethodsExplorer";
import { DELIVERY_METHOD_TYPE_OPTIONS, type ManagedDeliveryMethod } from "../types/delivery-method.types";

const TYPE_LABEL = Object.fromEntries(
  DELIVERY_METHOD_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const columns: DataExplorerColumn<ManagedDeliveryMethod>[] = [
  { key: "displayOrder", header: "Thứ tự" },
  { key: "name", header: "Tên phương thức" },
  {
    key: "type",
    header: "Loại",
    render: (row) => TYPE_LABEL[row.type] ?? row.type,
  },
  {
    key: "baseFee",
    header: "Phí",
    render: (row) => <MoneyDisplay value={row.baseFee} />,
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
 * Không có DeliveryZone (phí theo quận/huyện) trong Explorer này — quyết
 * định "Bắt đầu đơn giản" đã chốt, mỗi method chỉ có 1 baseFee cố định.
 */
export function DeliveryMethodsExplorer() {
  const { rows, isLoading, handleDelete } = useDeliveryMethodsExplorer();

  return (
    <DataExplorer<ManagedDeliveryMethod>
      title="Phương thức giao hàng"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code}`}
      searchPlaceholder="Tìm theo tên, mã..."
      createHref="/admin/settings/delivery-methods/new"
      createLabel="Thêm phương thức"
      editHref={(row) => `/admin/settings/delivery-methods/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có phương thức giao hàng nào."
    />
  );
}
