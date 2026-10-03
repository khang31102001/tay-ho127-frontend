import { createHttpClient } from "@/lib/http/api-client";

import type { PromotionValidateRequest, PromotionValidationResult } from "../types/promotion.types";

/**
 * Khách nhập mã giảm giá ở Checkout (không cần đăng nhập) — gọi Backend POST /api/v1/catalog/promotions/validate qua Route
 * Handler app/api/catalog/promotions/validate (trình duyệt không gọi Backend trực tiếp).
 *
 * Mã không dùng được là kết quả BÌNH THƯỜNG (200, isValid=false, message tiếng Việt hiển thị nguyên văn), không phải lỗi. Số
 * tiền giảm ở đây chỉ để HIỂN THỊ xem trước: khi đặt đơn, Backend tính lại toàn bộ từ mã — client không gửi số tiền giảm.
 */
const catalogPublicApi = createHttpClient("/api/catalog");

/** PromotionSummary/ValidatePromotionResponse của Backend (giá trị rỗng là null). */
type ValidateResponseDto = {
  isValid: boolean;
  promotion: { id: string; code: string; name: string; type: NonNullable<PromotionValidationResult["promotion"]>["type"] } | null;
  discountAmount: number;
  shippingDiscount: number;
  message: string | null;
};

export async function validatePromotion(request: PromotionValidateRequest): Promise<PromotionValidationResult> {
  const result = await catalogPublicApi.post<ValidateResponseDto>("/promotions/validate", request);

  return {
    isValid: result.isValid,
    promotion: result.promotion ?? undefined,
    discountAmount: result.discountAmount,
    shippingDiscount: result.shippingDiscount,
    message: result.message ?? undefined,
  };
}
