import type { ExportColumn } from "@/components/admin/import-export/import-export.types";
import type { ManagedCategory } from "@/features/categories";

import type { ManagedProduct } from "../types/product.types";

export type ProductExportRow = ManagedProduct & { categoryName: string };

/** Ghép categoryName vào Product để xuất file — dữ liệu gốc (giá, id...) giữ dạng thô, dễ import lại. */
export function buildProductExportRows(
  products: ManagedProduct[],
  categories: ManagedCategory[],
): ProductExportRow[] {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return products.map((product) => ({
    ...product,
    categoryName: categoryNameById.get(product.categoryId) ?? "",
  }));
}

export const PRODUCT_EXPORT_COLUMNS: ExportColumn<ProductExportRow>[] = [
  { key: "id", header: "id" },
  { key: "name", header: "Tên sản phẩm" },
  { key: "categoryName", header: "Danh mục" },
  { key: "price", header: "Giá", format: (row) => String(row.price) },
  { key: "description", header: "Mô tả", format: (row) => row.description ?? "" },
  { key: "status", header: "Trạng thái" },
];
