"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { formatCurrency } from "@/lib/format-currency";

import { useProductsExplorer, type ProductRow } from "../hooks/useProductsExplorer";

const columns: DataExplorerColumn<ProductRow>[] = [
  { key: "name", header: "Tên sản phẩm" },
  { key: "categoryName", header: "Danh mục" },
  {
    key: "price",
    header: "Giá",
    render: (row) => formatCurrency(row.price),
  },
  {
    key: "mediaIds",
    header: "Media",
    render: (row) => `${row.mediaIds.length} file`,
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function ProductsExplorer() {
  const { rows, isLoading, handleDelete } = useProductsExplorer();

  return (
    <DataExplorer<ProductRow>
      title="Quản lý sản phẩm"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.categoryName}`}
      searchPlaceholder="Tìm sản phẩm..."
      createHref="/admin/catalog/products/new"
      createLabel="Thêm sản phẩm"
      editHref={(row) => `/admin/catalog/products/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có sản phẩm nào."
    />
  );
}
