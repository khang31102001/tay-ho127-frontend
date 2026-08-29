"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { ExportButton } from "@/components/admin/import-export/ExportButton";
import { ImportDialog } from "@/components/admin/import-export/ImportDialog";
import { formatCurrency } from "@/lib/format-currency";
import { useAdminAuth } from "@/features/admin-auth";

import { useProductsExplorer, type ProductRow } from "../hooks/useProductsExplorer";
import { buildProductImportColumns } from "../import-export/product-import.config";
import { importProducts } from "../import-export/product-import.service";
import { buildProductExportRows, PRODUCT_EXPORT_COLUMNS } from "../import-export/product-export.service";

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
  const { rows, categories, isLoading, handleDelete, reload } = useProductsExplorer();
  const { user } = useAdminAuth();

  // Import/Export chỉ hiện cho admin có quyền quản lý thực đơn (Product thuộc
  // domain "thực đơn" sau khi gộp Catalog) — kiểm tra quyền trước khi cho dùng.
  const canManageProducts = user?.permissions?.includes("menu:manage") ?? false;

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
      toolbarActions={
        canManageProducts ? (
          <>
            <ExportButton
              label="Xuất file"
              fileName="san-pham.csv"
              columns={PRODUCT_EXPORT_COLUMNS}
              rows={buildProductExportRows(rows, categories)}
            />

            <ImportDialog
              title="Nhập sản phẩm hàng loạt"
              triggerLabel="Nhập file"
              config={{
                columns: buildProductImportColumns(categories),
                onImport: async (validRows) => {
                  const outcome = await importProducts(validRows);
                  await reload();
                  return outcome;
                },
              }}
            />
          </>
        ) : undefined
      }
    />
  );
}
