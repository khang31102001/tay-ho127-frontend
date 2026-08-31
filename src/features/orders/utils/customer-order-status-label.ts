import type { OrderStatus } from "../types/order-status";

/**
 * Nhãn trạng thái RIÊNG cho khách hàng (Order Tracking, Site) — KHÁC
 * ORDER_STATUS_LABEL (dùng cho Admin, ngôn ngữ vận hành như "Chờ xác nhận").
 * Theo #18: bước đầu tiên khách nhìn thấy là "Đã đặt hàng" (không phải "Chờ
 * xác nhận"), và bước cuối khác nhau theo Fulfillment — Pickup kết thúc bằng
 * "Đã nhận", Delivery kết thúc bằng "Đã giao".
 */
const BASE_LABEL: Record<OrderStatus, string> = {
  pending: "Đã đặt hàng",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng",
  delivering: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const PICKUP_OVERRIDE: Partial<Record<OrderStatus, string>> = {
  ready: "Sẵn sàng nhận",
  completed: "Đã nhận",
};

const DELIVERY_OVERRIDE: Partial<Record<OrderStatus, string>> = {
  completed: "Đã giao",
};

export function resolveCustomerOrderStatusLabel(status: OrderStatus, isPickup: boolean): string {
  const override = isPickup ? PICKUP_OVERRIDE : DELIVERY_OVERRIDE;
  return override[status] ?? BASE_LABEL[status];
}
