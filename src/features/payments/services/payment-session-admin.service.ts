import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";
// Import thẳng mapper/type của phiên thanh toán (không qua barrel @/features/payment) — barrel đó re-export PaymentPage
// (UI Site "use client"), lý do đầy đủ xem features/menu/services/menu.service.ts.
import { type PaymentSessionDto, toPaymentSession } from "@/features/payment/services/payment-session-mapper";
import type { PaymentSession, PaymentStatus } from "@/features/payment/types/payment.types";

/**
 * Admin → Sales → Thanh toán → phiên thanh toán QR/ví đang chờ nhân viên xác nhận, gọi Backend
 * /api/v1/sales/payment-sessions (xem: payments.view, xác nhận/từ chối: payments.manage).
 *
 * - Xác nhận = nhân viên đã đối chiếu và thấy tiền về: Backend TẠO ĐƠN HÀNG (thanh toán đã "paid") và đóng phiên trong một
 *   bước. 409 nếu phiên không còn chờ (đã hủy/hết hạn), giá đã đổi từ lúc báo giá, hoặc mã giảm giá đã hết lượt.
 * - Từ chối = không thấy tiền: phiên chuyển "failed" kèm ghi chú khách nhìn thấy; khách có thể thử lại.
 */
export async function listPaymentSessions(status?: PaymentStatus): Promise<PaymentSession[]> {
  const page = await adminApi.get<PaginatedResult<PaymentSessionDto>>("/sales/payment-sessions", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE, status },
  });
  return page.items.map(toPaymentSession);
}

export async function confirmPaymentSession(id: string): Promise<PaymentSession> {
  return toPaymentSession(await adminApi.post<PaymentSessionDto>(`/sales/payment-sessions/${id}/confirm`, {}));
}

export async function rejectPaymentSession(id: string, note?: string): Promise<PaymentSession> {
  return toPaymentSession(await adminApi.post<PaymentSessionDto>(`/sales/payment-sessions/${id}/reject`, { note }));
}
