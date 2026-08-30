import type { OrderStatus } from "./order-status";
import type { PaymentStatus } from "./payment-status";
import type { OrderItem } from "./order-item.types";
import type { OrderStatusHistoryEntry } from "./order-status-history.types";

/**
 * Order không phụ thuộc hoàn toàn vào Customer (customerId nullable — Guest
 * Checkout). customerName/phone/email/deliveryAddressSnapshot là bản sao tại
 * thời điểm đặt hàng, không tham chiếu sống — sửa hồ sơ Customer sau này
 * không làm thay đổi lịch sử Order.
 */
export type ManagedOrder = {
  id: string;
  orderCode: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddressSnapshot: string;
  /** Snapshot — chưa có domain PaymentMethod/DeliveryMethod quản lý (sẽ tới ở Phase sau), nên lưu cả code lẫn label hiển thị. */
  paymentMethodCode: string;
  paymentMethodLabel: string;
  deliveryMethodCode: string;
  deliveryMethodLabel: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
};
