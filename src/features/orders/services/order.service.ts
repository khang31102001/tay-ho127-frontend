import { adminApi } from "@/core/api/admin-api";
import { isApiError } from "@/core/api/api-error";
import type { PagedQuery, PaginatedResult } from "@/core/api/api-types";

import type { OrderStatus } from "../types/order-status";
import type { PaymentStatus } from "../types/payment-status";
import type { ManagedOrder } from "../types/order.types";
import { type OrderDto, toManagedOrderSingle, toManagedOrders } from "./order-mapper";

/**
 * Admin → Sales → Đơn hàng, gọi Backend /api/v1/sales/orders (quyền orders.view / orders.update-status / orders.cancel).
 * Đơn do khách đặt ở Site (site-order.service.ts); admin chỉ xem và đưa đơn qua các trạng thái.
 *
 * - Trạng thái hợp lệ kế tiếp do Backend quyết định (`ManagedOrder.nextStatuses`, đã tính cả nhánh "tự đến lấy" bỏ bước
 *   "Đang giao"); Backend vẫn kiểm tra lại, UI chỉ ẩn nút không hợp lệ.
 * - Hủy đơn cần thêm quyền orders.cancel (403 nếu thiếu); hủy đơn tự hủy thanh toán chưa thu và hoàn lại lượt dùng mã giảm
 *   giá, còn đơn đã thanh toán thì nhân viên hoàn tiền thủ công ở màn Thanh toán.
 */
export type OrderPageQuery = PagedQuery & { status?: OrderStatus; paymentStatus?: PaymentStatus };

/** 1 trang đơn hàng (mới nhất trước) — tìm theo mã đơn/tên/SĐT và lọc trạng thái do Backend xử lý. */
export async function listOrdersPage(
  query: OrderPageQuery,
  signal?: AbortSignal,
): Promise<PaginatedResult<ManagedOrder>> {
  const page = await adminApi.get<PaginatedResult<OrderDto>>("/sales/orders", { params: query, signal });
  return { ...page, items: await toManagedOrders(page.items) };
}

/** null khi không tồn tại (Backend 404). */
export async function getOrderById(id: string): Promise<ManagedOrder | null> {
  try {
    return await toManagedOrderSingle(await adminApi.get<OrderDto>(`/sales/orders/${id}`));
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/** Người thực hiện ghi vào lịch sử là tài khoản admin đang đăng nhập (Backend lấy từ token), không do UI gửi lên. */
export async function updateOrderStatus(id: string, toStatus: OrderStatus, note?: string): Promise<ManagedOrder> {
  return toManagedOrderSingle(await adminApi.post<OrderDto>(`/sales/orders/${id}/status`, { toStatus, note }));
}
