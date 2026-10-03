import { isApiError } from "@/lib/http/api-error";
import { salesApi } from "@/lib/http/sales-api";
// Import thẳng service/type (không qua barrel @/features/orders) — barrel đó re-export UI Admin, lý do đầy đủ xem
// features/menu/services/menu.service.ts.
import type { CreateOrderInput } from "@/features/orders/services/site-order.service";
import { rememberOrderPhone } from "@/features/orders/utils/order-phone-memory";

import type { PaymentSession } from "../types/payment.types";
import { type PaymentSessionDto, toPaymentSession } from "./payment-session-mapper";

/**
 * Phiên thanh toán phía TRANG SITE (QR / ví) — Backend /api/v1/sales/public/payment-sessions qua `salesApi`.
 *
 * Luồng: Checkout tạo phiên (CHƯA có đơn) → khách chuyển khoản → NHÂN VIÊN xác nhận đã nhận tiền ở Admin → Backend tạo đơn
 * (đã thanh toán) và đóng phiên → trang thanh toán thấy "success" và chuyển sang theo dõi đơn. Khách KHÔNG thể tự đánh dấu
 * "đã thanh toán": không có endpoint nào cho việc đó. Cổng thanh toán tự động (webhook) sau này sẽ thay bước xác nhận của
 * nhân viên, không đổi phía Site.
 */

/** Cùng body với đặt đơn (Backend tự tính mọi số tiền) — chỉ khác là chưa tạo đơn. Cùng idempotencyKey trả lại phiên đã tạo. */
export async function createPaymentSession(input: CreateOrderInput): Promise<PaymentSession> {
  return toPaymentSession(await salesApi.post<PaymentSessionDto>("/public/payment-sessions", input));
}

/** null khi không tồn tại (Backend 404). Backend tự chuyển phiên quá hạn sang "cancelled" khi đọc. */
export async function getPaymentSessionById(id: string): Promise<PaymentSession | null> {
  try {
    const session = toPaymentSession(await salesApi.get<PaymentSessionDto>(`/public/payment-sessions/${id}`));
    if (session.status === "success" && session.orderCode) {
      // Phiên thành công → trang theo dõi đơn cần SĐT để xác thực người xem; nhớ lại trên trình duyệt này.
      rememberOrderPhone(session.orderCode, session.phone);
    }
    return session;
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/** Khách chủ động hủy ("Hủy và quay lại giỏ hàng") — chưa từng có đơn nên không có gì để hoàn lại. */
export async function cancelPaymentSession(id: string): Promise<PaymentSession> {
  return toPaymentSession(await salesApi.post<PaymentSessionDto>(`/public/payment-sessions/${id}/cancel`, {}));
}

/** Sau khi nhân viên từ chối ("chưa thấy tiền"), khách có thể thử lại: failed → pending với hạn mới. */
export async function retryPaymentSession(id: string): Promise<PaymentSession> {
  return toPaymentSession(await salesApi.post<PaymentSessionDto>(`/public/payment-sessions/${id}/retry`, {}));
}
