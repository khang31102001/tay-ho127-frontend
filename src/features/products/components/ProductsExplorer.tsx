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
  { key: "slug", header: "Slug" },
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
  const { rows, categories, isLoading, loadError, handleDelete, reload } = useProductsExplorer();
  const { hasPermission } = useAdminAuth();

  // Import vừa tạo vừa cập nhật sản phẩm — cần cả 2 quyền.
  const canImport = hasPermission("products.create") && hasPermission("products.update");

  return (
    <DataExplorer<ProductRow>
      title="Quản lý sản phẩm"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.slug} ${row.categoryName}`}
      searchPlaceholder="Tìm sản phẩm..."
      createHref={hasPermission("products.create") ? "/admin/catalog/products/new" : undefined}
      createLabel="Thêm sản phẩm"
      editHref={(row) => `/admin/catalog/products/${row.id}`}
      onDelete={hasPermission("products.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có sản phẩm nào."}
      toolbarActions={
        <>
          <ExportButton
            label="Xuất file"
            fileName="san-pham.csv"
            columns={PRODUCT_EXPORT_COLUMNS}
            rows={buildProductExportRows(rows, categories)}
          />

          {canImport && (
            <ImportDialog
              title="Nhập sản phẩm hàng loạt"
              triggerLabel="Nhập file"
              config={{
                columns: buildProductImportColumns(categories),
                onImport: async (validRows) => {
                  const outcome = await importProducts(validRows, rows);
                  await reload();
                  return outcome;
                },
              }}
            />
          )}
        </>
      }
    />
  );
}
