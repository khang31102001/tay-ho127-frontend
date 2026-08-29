export const PAYMENT_TRANSACTION_ACTION_OPTIONS = [
  { value: "created", label: "Tạo giao dịch" },
  { value: "charge", label: "Ghi nhận thanh toán" },
  { value: "refund", label: "Hoàn tiền" },
  { value: "cancel", label: "Hủy giao dịch" },
  { value: "retry", label: "Thử lại giao dịch" },
] as const;

export type PaymentTransactionAction = (typeof PAYMENT_TRANSACTION_ACTION_OPTIONS)[number]["value"];

export type PaymentTransactionResult = "success" | "failed";

/**
 * Audit log append-only cho mỗi lần gọi gateway/đổi trạng thái Payment —
 * KHÔNG BAO GIỜ sửa hoặc xóa một entry đã ghi (immutable). Không lưu số thẻ,
 * CVV hay bất kỳ secret token nào — chỉ lưu message tóm tắt kết quả.
 */
export type ManagedPaymentTransaction = {
  id: string;
  paymentId: string;
  action: PaymentTransactionAction;
  result: PaymentTransactionResult;
  gateway?: string;
  gatewayReference?: string;
  message?: string;
  changedBy: string;
  createdAt: string;
};
