import { createHttpClient } from "@/lib/http/api-client";

import type { PromotionValidateRequest, PromotionValidationResult } from "../types/promotion.types";

/**
 * Checkout (Site, khách chưa đăng nhập) kiểm tra mã giảm giá — Backend
 * POST /api/v1/catalog/promotions/validate qua Route Handler công khai
 * app/api/promotions/validate (trình duyệt không gọi Backend trực tiếp).
 *
 * Backend là nơi DUY NHẤT tính giảm giá (loại mã, đơn tối thiểu, hạn dùng,
 * phạm vi sản phẩm/danh mục). Mã không dùng được vẫn là HTTP 200 với
 * `isValid: false` + `message` tiếng Việt hiển thị nguyên văn; chỉ lỗi hệ
 * thống (mạng, 429, 5xx) mới bị ném ra.
 *
 * File này cố ý tách khỏi promotion.service.ts (Admin) và không đi qua barrel
 * index.ts để bundle Checkout không kéo theo UI Admin.
 */
const publicClient = createHttpClient("/api/promotions");

export function validatePromotion(request: PromotionValidateRequest): Promise<PromotionValidationResult> {
  return publicClient.post<PromotionValidationResult, PromotionValidateRequest>("/validate", request);
}
