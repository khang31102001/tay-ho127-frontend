"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { formatCurrency } from "@/lib/format-currency";

import { useMenuProductsExplorer } from "../hooks/useMenuProductsExplorer";
import type { ManagedMenuProductRow } from "../types/menu-product.types";

const columns: DataExplorerColumn<ManagedMenuProductRow>[] = [
  { key: "menuName", header: "Thực đơn" },
  { key: "productName", header: "Sản phẩm" },
  {
    key: "effectivePrice",
    header: "Giá áp dụng",
    render: (row) => formatCurrency(row.effectivePrice),
  },
  { key: "sortOrder", header: "Thứ tự" },
  {
    key: "isAvailable",
    header: "Tình trạng",
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
          row.isAvailable
            ? "bg-brand-green/10 text-brand-greenDark"
            : "bg-brand-muted/10 text-brand-muted"
        }`}
      >
        {row.isAvailable ? "Còn hàng" : "Hết hàng"}
      </span>
    ),
  },
];

export function MenuProductsExplorer() {
  const { rows, isLoading, handleDelete } = useMenuProductsExplorer();

  return (
    <DataExplorer<ManagedMenuProductRow>
      title="Liên kết Thực đơn ↔ Sản phẩm"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.menuName} ${row.productName}`}
      searchPlaceholder="Tìm theo thực đơn hoặc sản phẩm..."
      createHref="/admin/catalog/menu-products/new"
      createLabel="Thêm liên kết"
      editHref={(row) => `/admin/catalog/menu-products/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có liên kết nào."
    />
  );
}
