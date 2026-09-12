// Đi thẳng vào api/type của Promotion thay vì qua index.ts (barrel) — barrel
// còn re-export "use client" PromotionsExplorer/PromotionEditor (Admin UI), import
// qua đó sẽ kéo thêm UI Admin vào bundle JS của Checkout (site công khai), giống lý
// do order.service.ts đi thẳng vào product.service.ts thay vì barrel features/products.
// promotionApi (không phải service trực tiếp) để khi NEXT_PUBLIC_API_MODE=real,
// Checkout tự chuyển sang gọi Backend thật qua POST /promotions/validate mà
// không cần sửa file này.
import { promotionApi } from "@/features/promotions/api/promotion-api";
import type { PromotionValidateRequestItem } from "@/features/promotions/types/promotion.types";

/** Kết quả áp dụng mã thành công — Checkout State giữ nguyên object này để gửi lên `createOrder()`/`createPaymentSession()`. */
export interface AppliedDiscount {
  promotionId: string;
  discountCode: string;
  discountAmount: number;
  /** Số tiền được giảm trên phí giao hàng (mã "free_shipping") — 0 với các loại mã khác. */
  shippingDiscount: number;
  description: string;
}

/**
 * Cầu nối giữa Checkout và domain Promotion (features/promotions) — Checkout
 * KHÔNG tự hiểu business rule (percentage/fixed/free_shipping/product_discount),
 * chỉ gọi `validatePromotion()` rồi map kết quả chuẩn hóa sang shape
 * `AppliedDiscount` mà `useCheckoutForm`/`DiscountCodeSection` đang dùng —
 * đổi/thêm loại mã mới chỉ cần sửa features/promotions, KHÔNG phải sửa file
 * này hay bất kỳ component Checkout nào.
 */
export async function applyDiscountCode(
  rawCode: string,
  params: { subtotal: number; shippingFee: number; items: PromotionValidateRequestItem[] },
): Promise<AppliedDiscount> {
  const result = await promotionApi.validate({
    code: rawCode,
    subtotal: params.subtotal,
    shippingFee: params.shippingFee,
    items: params.items,
  });

  if (!result.isValid || !result.promotion) {
    throw new Error(result.message ?? "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
  }

  return {
    promotionId: result.promotion.id,
    discountCode: result.promotion.code,
    discountAmount: result.discountAmount,
    shippingDiscount: result.shippingDiscount,
    description: result.promotion.name,
  };
}
