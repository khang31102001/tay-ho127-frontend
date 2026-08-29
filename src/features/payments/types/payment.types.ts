import type { PaymentStatus } from "@/features/orders";

/**
 * Payment tách biệt khỏi Order để sau này gắn cổng thanh toán thật (VNPay,
 * MoMo, ZaloPay, Stripe...) mà không phải sửa Order. PaymentStatus tái sử
 * dụng type từ features/orders (không định nghĩa trùng) — Order.paymentStatus
 * vẫn giữ lại như một field snapshot để hiển thị nhanh ở list/badge, được
 * đồng bộ bởi payment.service mỗi khi Payment đổi trạng thái.
 */
export type ManagedPayment = {
  id: string;
  orderId: string;
  orderCode: string;
  paymentMethodCode: string;
  paymentMethodLabel: string;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  gateway?: string;
  gatewayReference?: string;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
