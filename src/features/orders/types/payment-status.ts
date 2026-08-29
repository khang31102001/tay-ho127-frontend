/**
 * PaymentStatus tách biệt khỏi OrderStatus theo đúng yêu cầu — 1 Order
 * COMPLETED vẫn có thể có Payment REFUNDED sau đó, 2 trục trạng thái độc
 * lập. Đặt tại đây (Order) vì Order cần field này trước khi domain Payment
 * (Phase 04) tồn tại — Payment sau này import lại type từ features/orders,
 * không định nghĩa trùng.
 */
export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "failed", label: "Thất bại" },
  { value: "refunded", label: "Đã hoàn tiền" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number]["value"];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = Object.fromEntries(
  PAYMENT_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<PaymentStatus, string>;

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  pending: "neutral",
  paid: "success",
  failed: "danger",
  refunded: "warning",
  cancelled: "danger",
};
