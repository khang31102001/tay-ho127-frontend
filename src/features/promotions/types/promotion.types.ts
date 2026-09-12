export type PromotionType = "percentage" | "fixed_amount" | "free_shipping" | "product_discount";

/** Registry nhãn hiển thị — centralized, tránh hard-code text rải rác ở component (giống ORDER_STATUS_LABEL của features/orders). */
export const PROMOTION_TYPE_LABEL: Record<PromotionType, string> = {
  percentage: "Giảm theo %",
  fixed_amount: "Giảm số tiền cố định",
  free_shipping: "Miễn phí vận chuyển",
  product_discount: "Giảm giá sản phẩm/danh mục",
};

/**
 * "draft"/"active"/"inactive" là lựa chọn của Admin — "expired" là trạng thái
 * suy ra từ `endAt` tại thời điểm đọc (xem `resolvePromotionEffectiveStatus`
 * ở promotion.service.ts), KHÔNG cần Admin tự tay chuyển sang "expired".
 */
export type PromotionStatus = "draft" | "active" | "inactive" | "expired";

export const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  draft: "Nháp",
  active: "Đang áp dụng",
  inactive: "Ngừng áp dụng",
  expired: "Hết hạn",
};

export const PROMOTION_STATUS_TONE: Record<PromotionStatus, "neutral" | "success" | "danger"> = {
  draft: "neutral",
  active: "success",
  inactive: "neutral",
  expired: "danger",
};

/**
 * MOCK CONTRACT — chưa có Backend Promotion thật. Model tương ứng
 * `GET/POST/PUT /api/promotions` dự kiến ở ASP.NET Core sau này (xem
 * promotion.service.ts) — id/code/... giữ nguyên khi map sang DTO thật.
 */
export type ManagedPromotion = {
  id: string;
  code: string;
  name: string;
  description?: string;

  type: PromotionType;
  /** percentage: 0-100 (%). fixed_amount: số tiền VNĐ. free_shipping: % phí giao hàng được miễn (100 = miễn phí toàn bộ). product_discount: 0-100 (%) áp dụng cho sản phẩm/danh mục thuộc phạm vi. */
  value: number;
  /** Trần số tiền giảm — chỉ có ý nghĩa với type "percentage"/"product_discount" (giá trị theo %). */
  maxDiscountAmount?: number;
  minimumOrderAmount?: number;

  startAt?: string;
  endAt?: string;

  usageLimit?: number;
  usageCount: number;

  /** Chỉ dùng khi type = "product_discount" — tham chiếu ManagedProduct.id (features/products). */
  applicableProductIds?: string[];
  /** Chỉ dùng khi type = "product_discount" — tham chiếu ManagedCategory.id (features/categories, đã gồm cả 3 tầng group/category/subCategory). */
  applicableCategoryIds?: string[];

  status: PromotionStatus;

  createdAt: string;
  updatedAt: string;
};

/** Input tối thiểu Checkout cần gửi để Promotion Service tự tra cứu lại giá/danh mục thật — không tin lineTotal hiển thị nếu backend thật sau này muốn tự tính lại. */
export type PromotionValidateRequestItem = {
  productId: string;
  lineTotal: number;
};

/**
 * Request contract tương ứng `POST /api/promotions/validate` dự kiến ở Backend
 * thật. `items` (thay vì chỉ `productIds` phẳng) để Promotion Service tính
 * đúng discount cho type "product_discount" khi giỏ hàng có nhiều dòng khác
 * đơn giá — không thể tính "10% các sản phẩm thuộc category X" nếu không biết
 * lineTotal từng dòng.
 */
export type PromotionValidateRequest = {
  code: string;
  subtotal: number;
  shippingFee: number;
  items: PromotionValidateRequestItem[];
};

/**
 * Kết quả chuẩn hóa DUY NHẤT mà Checkout được phép đọc — Checkout không tự
 * hiểu business rule (percentage/fixed/free_shipping/product_discount), chỉ
 * đọc discountAmount/shippingDiscount đã tính sẵn ở đây.
 */
export interface PromotionValidationResult {
  isValid: boolean;
  promotion?: Pick<ManagedPromotion, "id" | "code" | "name" | "type">;
  discountAmount: number;
  shippingDiscount: number;
  message?: string;
}
