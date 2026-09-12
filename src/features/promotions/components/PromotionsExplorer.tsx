"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { formatCurrency } from "@/lib/format-currency";

import { usePromotionsExplorer, type PromotionRow } from "../hooks/usePromotionsExplorer";
import { PROMOTION_TYPE_LABEL } from "../types/promotion.types";
import { PromotionStatusBadge } from "./PromotionStatusBadge";

function formatDate(value?: string): string {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "—";
}

function formatPromotionValue(row: PromotionRow): string {
  if (row.type === "fixed_amount") {
    return formatCurrency(row.value);
  }

  return `${row.value}%`;
}

const columns: DataExplorerColumn<PromotionRow>[] = [
  { key: "code", header: "Mã" },
  { key: "name", header: "Tên chương trình" },
  { key: "type", header: "Loại giảm giá", render: (row) => PROMOTION_TYPE_LABEL[row.type] },
  { key: "value", header: "Giá trị giảm", render: formatPromotionValue },
  {
    key: "minimumOrderAmount",
    header: "Đơn tối thiểu",
    render: (row) => (row.minimumOrderAmount ? formatCurrency(row.minimumOrderAmount) : "—"),
  },
  { key: "startAt", header: "Ngày bắt đầu", render: (row) => formatDate(row.startAt) },
  { key: "endAt", header: "Ngày kết thúc", render: (row) => formatDate(row.endAt) },
  {
    key: "usageCount",
    header: "Lượt dùng",
    render: (row) => (row.usageLimit ? `${row.usageCount}/${row.usageLimit}` : `${row.usageCount}`),
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <PromotionStatusBadge status={row.effectiveStatus} />,
  },
];

export function PromotionsExplorer() {
  const { rows, isLoading, handleDelete } = usePromotionsExplorer();

  return (
    <DataExplorer<PromotionRow>
      title="Quản lý mã giảm giá"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.code} ${row.name}`}
      searchPlaceholder="Tìm theo mã hoặc tên..."
      createHref="/admin/catalog/promotions/new"
      createLabel="Thêm mã giảm giá"
      editHref={(row) => `/admin/catalog/promotions/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có mã giảm giá nào."
    />
  );
}
