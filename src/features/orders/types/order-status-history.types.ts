import type { OrderStatus } from "./order-status";

/**
 * 1 lần đổi trạng thái của Order — nhúng trực tiếp trong ManagedOrder.statusHistory
 * (không phải localStorage key riêng), vì chỉ hiển thị read-only dạng
 * Timeline trong Order Detail, không có màn CRUD độc lập.
 */
export type OrderStatusHistoryEntry = {
  /** null cho entry đầu tiên (khởi tạo đơn). */
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedAt: string;
  /** "Khách hàng" khi tự đặt hàng, hoặc tên admin thực hiện thao tác. */
  changedBy: string;
  note?: string;
};
