import { adminApi } from "@/lib/http/admin-api";

import type { ManagedPaymentTransaction } from "../types/payment-transaction.types";

/** PaymentTransactionResponse của Backend — khớp ManagedPaymentTransaction (giá trị rỗng là null). */
type PaymentTransactionDto = Omit<ManagedPaymentTransaction, "gateway" | "gatewayReference" | "message"> & {
  gateway: string | null;
  gatewayReference: string | null;
  message: string | null;
};

/**
 * Nhật ký giao dịch của một thanh toán (cũ nhất trước) — CHỈ ĐỌC: Backend chỉ thêm dòng mới mỗi lần đổi trạng thái, không có
 * API sửa hay xóa. Không chứa số thẻ/CVV/secret, chỉ tóm tắt kết quả.
 */
export async function listTransactionsByPaymentId(paymentId: string): Promise<ManagedPaymentTransaction[]> {
  const transactions = await adminApi.get<PaymentTransactionDto[]>(`/sales/payments/${paymentId}/transactions`);
  return transactions.map((transaction) => ({
    ...transaction,
    gateway: transaction.gateway ?? undefined,
    gatewayReference: transaction.gatewayReference ?? undefined,
    message: transaction.message ?? undefined,
  }));
}
