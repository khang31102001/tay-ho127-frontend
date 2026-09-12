"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { MODIFIER_SELECTION_TYPE_OPTIONS } from "@/features/modifier-groups/types/modifier-group.types";

import { useOrderOptionsExplorer } from "../hooks/useOrderOptionsExplorer";
import type { ManagedOrderOptionGroup } from "../types/order-option.types";

const SELECTION_TYPE_LABEL = Object.fromEntries(
  MODIFIER_SELECTION_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const columns: DataExplorerColumn<ManagedOrderOptionGroup>[] = [
  { key: "name", header: "Tên nhóm" },
  {
    key: "selectionType",
    header: "Kiểu chọn",
    render: (row) => SELECTION_TYPE_LABEL[row.selectionType] ?? row.selectionType,
  },
  {
    key: "options",
    header: "Số lựa chọn",
    render: (row) => row.options.length,
  },
  {
    key: "isRequired",
    header: "Bắt buộc",
    render: (row) => (row.isRequired ? "✓" : "—"),
  },
];

/**
 * Quản lý "General Order Options" (Nước mắm/Rau...) — áp dụng cho TOÀN đơn,
 * KHÁC "Tùy chọn món (Modifier)" (features/modifier-groups, gắn với 1 Product
 * cụ thể) dù dùng chung shape dữ liệu (xem order-option.types.ts). Cart/
 * Checkout đọc danh sách qua listGeneralOrderOptions() — sửa/thêm/xóa tại đây
 * không cần đổi gì ở Cart/Checkout.
 */
export function OrderOptionsExplorer() {
  const { rows, isLoading, handleDelete } = useOrderOptionsExplorer();

  return (
    <DataExplorer<ManagedOrderOptionGroup>
      title="Tùy chọn chung cho đơn hàng"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.options.map((option) => option.label).join(" ")}`}
      searchPlaceholder="Tìm theo tên nhóm, tên lựa chọn..."
      createHref="/admin/settings/order-options/new"
      createLabel="Thêm nhóm"
      editHref={(row) => `/admin/settings/order-options/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có General Order Option nào."
    />
  );
}
