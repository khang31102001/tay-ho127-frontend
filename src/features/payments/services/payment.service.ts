import type { PaymentStatus } from "@/features/orders";
import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import { isApiError } from "@/lib/http/api-error";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedPayment } from "../types/payment.types";

/**
 * Admin → Sales → Thanh toán, gọi Backend /api/v1/sales/payments (quyền payments.view / payments.manage).
 *
 * - Bản ghi thanh toán do Backend tạo cùng đơn hàng (COD: "chờ thanh toán"; QR/ví: đã "paid" ngay khi nhân viên xác nhận
 *   phiên thanh toán). Admin không tự tạo thanh toán và không xóa.
 * - "Đã thanh toán" chỉ do người có quyền payments.manage (hoặc cổng thanh toán sau này) đặt — khách không tự đặt được.
 * - Trạng thái kế tiếp hợp lệ do Backend quyết định (`nextStatuses`); mỗi lần chuyển Backend ghi một dòng nhật ký bất biến
 *   (payment-transaction.service.ts) và đồng bộ trạng thái thanh toán của đơn hàng.
 */

/** PaymentResponse của Backend — khớp ManagedPayment 1:1 (giá trị rỗng là null, được chuẩn hóa ở toManagedPayment). */
type PaymentDto = Omit<ManagedPayment, "transactionId" | "gateway" | "gatewayReference"> & {
  transactionId: string | null;
  gateway: string | null;
  gatewayReference: string | null;
};

function toManagedPayment(dto: PaymentDto): ManagedPayment {
  return {
    ...dto,
    transactionId: dto.transactionId ?? undefined,
    gateway: dto.gateway ?? undefined,
    gatewayReference: dto.gatewayReference ?? undefined,
  };
}

export async function listPayments(): Promise<ManagedPayment[]> {
  const page = await adminApi.get<PaginatedResult<PaymentDto>>("/sales/payments", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedPayment);
}

/** null khi không tồn tại (Backend 404). */
export async function getPaymentById(id: string): Promise<ManagedPayment | null> {
  try {
    return toManagedPayment(await adminApi.get<PaymentDto>(`/sales/payments/${id}`));
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/** Người thực hiện ghi vào nhật ký là tài khoản admin đang đăng nhập (Backend lấy từ token). 400 nếu chuyển trạng thái không hợp lệ. */
export async function transitionPayment(paymentId: string, toStatus: PaymentStatus, note?: string): Promise<ManagedPayment> {
  return toManagedPayment(await adminApi.post<PaymentDto>(`/sales/payments/${paymentId}/transition`, { toStatus, note }));
}
