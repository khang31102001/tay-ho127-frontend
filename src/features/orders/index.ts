export { OrdersExplorer } from "./components/OrdersExplorer";
export { OrderDetail } from "./components/OrderDetail";
export { PaymentStatusBadge } from "./components/PaymentStatusBadge";

export { listOrders, getOrderById, getOrderByCode, listCustomerOrders, createOrder, updateOrderStatus, updateOrderPaymentStatus } from "./services/order.service";
export type { CreateOrderInput, CreateOrderItemInput, CreateOrderItemModifierInput } from "./services/order.service";

export { ORDER_STATUS_OPTIONS, ORDER_STATUS_LABEL, ORDER_STATUS_TRANSITIONS } from "./types/order-status";
export type { OrderStatus } from "./types/order-status";

export { PAYMENT_STATUS_OPTIONS, PAYMENT_STATUS_LABEL } from "./types/payment-status";
export type { PaymentStatus } from "./types/payment-status";

export type { ManagedOrder } from "./types/order.types";
export type { OrderItem, OrderItemModifierSnapshot } from "./types/order-item.types";
export type { OrderStatusHistoryEntry } from "./types/order-status-history.types";

export { generateOrderCode, DEFAULT_ORDER_CODE_CONFIG } from "./utils/order-code";
export type { OrderCodeConfig } from "./utils/order-code";

export { resolveCustomerOrderStatusLabel } from "./utils/customer-order-status-label";
