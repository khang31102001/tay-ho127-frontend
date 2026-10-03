import { isApiError } from "@/lib/http/api-error";
import type { PaginatedResult } from "@/lib/http/api-types";
import { salesApi } from "@/lib/http/sales-api";

import type { ManagedOrder } from "../types/order.types";
import { rememberOrderPhone } from "../utils/order-phone-memory";
import { type OrderDto, toManagedOrderSingle, toManagedOrders } from "./order-mapper";

/**
 * Đơn hàng phía TRANG SITE — gọi Backend /api/v1/sales/public/orders và /customer/orders qua `salesApi` (không dùng quyền
 * admin). Khách vãng lai đặt hàng không cần tài khoản; khách đã đăng nhập thì Backend tự liên kết đơn qua cookie phiên.
 *
 * Backend là nơi DUY NHẤT tính tiền: client chỉ gửi id món/lựa chọn, số lượng và mã giảm giá — KHÔNG gửi đơn giá, phí giao
 * hay số tiền giảm. Mọi con số trong đơn trả về là con số của máy chủ.
 */

export type CreateOrderItemModifierInput = {
  groupId: string;
  optionId: string;
};

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
  note?: string;
  modifiers?: CreateOrderItemModifierInput[];
};

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  email?: string;
  /** Bỏ qua với phương thức "tự đến lấy" (dùng địa chỉ của phương thức). */
  deliveryAddress?: string;
  paymentMethodCode: string;
  deliveryMethodCode: string;
  items: CreateOrderItemInput[];
  wantsUtensils: boolean;
  note?: string;
  /** Tùy chọn chung của đơn (Nước mắm/Rau...) — chỉ gửi groupId + optionId. */
  orderOptions?: CreateOrderItemModifierInput[];
  /** Mã giảm giá khách nhập — Backend tính lại số tiền giảm và từ chối nếu không hợp lệ. */
  discountCode?: string;
  /** Sinh 1 lần cho mỗi lượt Checkout (giữ nguyên khi thử lại) — cùng key chỉ tạo 1 đơn, các lần sau trả lại đơn đã tạo. */
  idempotencyKey?: string;
};

/** Đặt đơn thanh toán khi nhận hàng. Phương thức thanh toán trước đi qua phiên thanh toán (features/payment). */
export async function createOrder(input: CreateOrderInput): Promise<ManagedOrder> {
  const order = await toManagedOrderSingle(await salesApi.post<OrderDto>("/public/orders", input));
  // Trang theo dõi (/don-hang/{mã}) cần SĐT để xác thực người xem — nhớ lại trên trình duyệt này để khách khỏi nhập lại.
  rememberOrderPhone(order.orderCode, input.phone);
  return order;
}

/** Tra cứu đơn của khách vãng lai: cần ĐÚNG cả mã đơn lẫn SĐT đặt hàng. null khi không khớp (Backend 404). */
export async function lookupOrder(orderCode: string, phone: string): Promise<ManagedOrder | null> {
  try {
    const order = await toManagedOrderSingle(await salesApi.post<OrderDto>("/public/orders/lookup", { orderCode, phone }));
    rememberOrderPhone(order.orderCode, phone);
    return order;
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/** Khách bấm "Thanh toán lại" khi thanh toán thất bại (failed → pending). */
export async function retryOrderPayment(orderCode: string, phone: string): Promise<ManagedOrder> {
  return toManagedOrderSingle(await salesApi.post<OrderDto>("/public/orders/retry-payment", { orderCode, phone }));
}

/** Lịch sử đơn của khách đang đăng nhập (mới nhất trước). 401 nếu chưa đăng nhập. */
export async function listCustomerOrders(): Promise<ManagedOrder[]> {
  const page = await salesApi.get<PaginatedResult<OrderDto>>("/customer/orders", { params: { pageSize: 100 } });
  return toManagedOrders(page.items);
}

/** Một đơn của khách đang đăng nhập theo mã. null nếu không phải đơn của họ (Backend 404). */
export async function getCustomerOrder(orderCode: string): Promise<ManagedOrder | null> {
  try {
    return await toManagedOrderSingle(await salesApi.get<OrderDto>(`/customer/orders/${encodeURIComponent(orderCode)}`));
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}
