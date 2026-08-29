import type { ImportColumn } from "@/components/admin/import-export/import-export.types";
import type { ManagedCategory } from "@/features/categories";
import { normalizeText } from "@/lib/normalize-text";

import type { ProductImportRow } from "./product-import.types";

/**
 * Cấu hình cột Import CSV của Product. Là hàm (không phải const tĩnh) vì cột
 * "Danh mục" cần resolve categoryName → categoryId theo danh sách category
 * đang có — ProductsExplorer gọi hàm này với category đã load sẵn.
 */
export function buildProductImportColumns(
  categories: ManagedCategory[],
): ImportColumn<ProductImportRow>[] {
  const categoryIdByName = new Map(
    categories.map((category) => [normalizeText(category.name), category.id]),
  );

  return [
    { key: "id", header: "id" },
    { key: "name", header: "Tên sản phẩm", required: true },
    {
      key: "categoryId",
      header: "Danh mục",
      required: true,
      parse: (rawValue) => categoryIdByName.get(normalizeText(rawValue)) ?? "",
      validate: (value, rawRow) =>
        value ? null : `Danh mục không tồn tại: "${rawRow["Danh mục"]}"`,
    },
    {
      key: "price",
      header: "Giá",
      required: true,
      parse: (rawValue) => Number(rawValue.replace(/[^\d.-]/g, "")),
      validate: (value) =>
        typeof value === "number" && !Number.isNaN(value) && value >= 0
          ? null
          : "Giá không hợp lệ",
    },
    { key: "description", header: "Mô tả" },
    {
      key: "status",
      header: "Trạng thái",
      parse: (rawValue) => (rawValue.trim().toLowerCase() === "inactive" ? "inactive" : "active"),
    },
  ];
}
