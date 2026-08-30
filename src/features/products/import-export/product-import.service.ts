import type { ImportOutcome } from "@/components/admin/import-export/import-export.types";

import { bulkUpsertProducts } from "../services/product.service";
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

/**
 * Lưu các dòng Product đã qua validate ở ImportDialog. `bulkUpsertProducts`
 * (features/products/services/product.service.ts) sở hữu logic tạo/cập nhật —
 * feature này chỉ chuyển đổi kết quả sang ImportOutcome cho UI dùng chung.
 */
export async function importProducts(
  rows: Partial<ProductImportRow>[],
): Promise<ImportOutcome<ProductImportRow>> {
  const validRows = rows.filter(isCompleteRow);

  if (validRows.length === 0) {
    return {
      successCount: 0,
      failures: [{ row: {}, message: "Không có dòng hợp lệ để nhập." }],
    };
  }

  try {
    await bulkUpsertProducts(
      validRows.map((row) => ({
        id: row.id,
        name: row.name,
        categoryId: row.categoryId,
        price: row.price,
        description: row.description,
        status: row.status,
      })),
    );

    return { successCount: validRows.length, failures: [] };
  } catch (error) {
    return {
      successCount: 0,
      failures: [
        {
          row: {},
          message: error instanceof Error ? error.message : "Lưu dữ liệu thất bại.",
        },
      ],
    };
  }
}
