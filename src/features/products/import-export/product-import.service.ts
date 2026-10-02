import type { ImportOutcome } from "@/components/admin/import-export/import-export.types";

import { createProduct, updateProduct } from "../services/product.service";
import type { ManagedProduct } from "../types/product.types";
import type { ProductImportRow } from "./product-import.types";

function isCompleteRow(
  row: Partial<ProductImportRow>,
): row is ProductImportRow {
  return (
    typeof row.name === "string" &&
    typeof row.categoryId === "string" &&
    typeof row.price === "number" &&
    typeof row.status === "string"
  );
}

/** ApiError (lỗi Backend đã chuẩn hóa ở api-client) cũng là Error — message đã hiển thị được. */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : "Lưu dữ liệu thất bại.";
}

/**
 * Lưu các dòng Product đã qua validate ở ImportDialog, lần lượt từng dòng qua
 * Backend: dòng có `id` khớp sản phẩm hiện có → cập nhật (chỉ các cột trong
 * file; slug, ảnh, nhóm tùy chọn, giá gốc, nhãn, đánh giá giữ nguyên), còn
 * lại → tạo mới (slug tự sinh từ tên). Dòng lỗi không chặn các dòng khác —
 * mỗi dòng lỗi được báo riêng trong ImportOutcome.
 */
export async function importProducts(
  rows: Partial<ProductImportRow>[],
  existingProducts: ManagedProduct[],
): Promise<ImportOutcome<ProductImportRow>> {
  const validRows = rows.filter(isCompleteRow);

  if (validRows.length === 0) {
    return {
      successCount: 0,
      failures: [{ row: {}, message: "Không có dòng hợp lệ để nhập." }],
    };
  }

  const existingById = new Map(existingProducts.map((product) => [product.id, product]));
  const outcome: ImportOutcome<ProductImportRow> = { successCount: 0, failures: [] };

  for (const row of validRows) {
    const existing = row.id ? existingById.get(row.id) : undefined;

    try {
      if (existing) {
        const { id, ...current } = existing;
        await updateProduct(id, {
          ...current,
          name: row.name,
          categoryId: row.categoryId,
          price: row.price,
          description: row.description,
          status: row.status,
        });
      } else {
        await createProduct({
          name: row.name,
          slug: "",
          categoryId: row.categoryId,
          price: row.price,
          description: row.description,
          status: row.status,
          mediaIds: [],
          modifierGroupIds: [],
        });
      }
      outcome.successCount += 1;
    } catch (error) {
      outcome.failures.push({ row, message: describeError(error) });
    }
  }

  return outcome;
}
