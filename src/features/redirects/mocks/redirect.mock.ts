import type { ManagedRedirect } from "../types/redirect.types";

/**
 * MOCK CONTRACT — 1 ví dụ minh hoạ đúng use case Task 25: sản phẩm từng có
 * slug "banh-cuon-nhan-thit-cu" (giả định đã đổi tên) nay trỏ 301 về id thật
 * "product-bc001" (product.id = slug — xem database-analysis.md).
 */
export const SEED_REDIRECTS: ManagedRedirect[] = [
  {
    id: "redirect-1",
    sourcePath: "/thuc-don/banh-cuon-nhan-thit-cu",
    destinationUrl: "/thuc-don/product-bc001",
    redirectType: 301,
    isActive: true,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
  },
];
