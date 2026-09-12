import type { OrderStatus } from "./order-status";
import type { PaymentStatus } from "./payment-status";
import type { OrderItem, OrderItemModifierSnapshot } from "./order-item.types";
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
  /** Chống double-submit (double click, mất mạng rồi bấm lại...) — cùng 1 idempotencyKey chỉ tạo 1 Order duy nhất, các lần gọi sau trả lại chính Order đã tạo. Không có ở Order cũ trước khi field này tồn tại. */
  idempotencyKey?: string;
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
  /** Snapshot từ DeliveryMethod.type tại thời điểm đặt hàng — dùng để chọn nhánh Timeline đúng cho Order Tracking (#18: Pickup vs Delivery có wording khác nhau). */
  isPickup: boolean;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  subtotal: number;
  discount: number;
  /** Mã giảm giá khách đã dùng (nếu có) — lưu kèm `discount`/`promotionId` để tra cứu/đối soát sau này, không chỉ lưu số tiền. */
  discountCode?: string;
  promotionId?: string;
  /** Số tiền được giảm trên `deliveryFee` (mã giảm giá loại "free_shipping") — 0 nếu không áp dụng. */
  shippingDiscount: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Order Preference — áp dụng cho toàn đơn, không thuộc CartItem/Product. Mặc định true (đa số khách nhận đồ ăn ngoài quán cần dụng cụ). */
  wantsUtensils: boolean;
  note?: string;
  /**
   * General Order Options đã chọn (Nước mắm/Rau...) — snapshot tại thời điểm
   * đặt hàng (label/giá lúc đó), KHÔNG tham chiếu sống tới
   * ManagedOrderOptionGroup (features/order-options). Áp dụng cho TOÀN đơn,
   * không thuộc từng OrderItem — đã cộng vào `subtotal` (xem order.service.ts).
   */
  orderOptionSelections: OrderItemModifierSnapshot[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
};
