import { SEED_ORDERS } from "../mocks/order.mock";
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from "../types/order-status";
import type { PaymentStatus } from "../types/payment-status";
import type { OrderItem } from "../types/order-item.types";
import type { ManagedOrder } from "../types/order.types";

const STORAGE_KEY = "tayho-admin-orders";
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readStore(): ManagedOrder[] {
  if (typeof window === "undefined") {
    return SEED_ORDERS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  }
  return JSON.parse(raw) as ManagedOrder[];
}

function writeStore(orders: ManagedOrder[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function generateOrderCode(existing: ManagedOrder[]): string {
  const maxNumber = existing.reduce((max, order) => {
    const match = /^DH(\d+)$/.exec(order.orderCode);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);
  return `DH${String(maxNumber + 1).padStart(5, "0")}`;
}

export async function listOrders(): Promise<ManagedOrder[]> {
  await delay();
  return [...readStore()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(id: string): Promise<ManagedOrder | undefined> {
  await delay();
  return readStore().find((order) => order.id === id);
}

export type CreateOrderInput = {
  customerId: string | null;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddressSnapshot: string;
  paymentMethodCode: string;
  paymentMethodLabel: string;
  deliveryMethodCode: string;
  deliveryMethodLabel: string;
  items: OrderItem[];
  discount?: number;
  deliveryFee?: number;
  note?: string;
};

/**
 * Backend/API phải tính lại tổng tiền — không tin subtotal/totalAmount gửi
 * từ Frontend. Hàm này tự cộng lại từ items để mô phỏng đúng quy tắc đó.
 */
export async function createOrder(input: CreateOrderInput): Promise<ManagedOrder> {
  await delay();
  const existing = readStore();
  const now = new Date().toISOString();
  const subtotal = input.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = input.discount ?? 0;
  const deliveryFee = input.deliveryFee ?? 0;

  const order: ManagedOrder = {
    id: `order-${Date.now()}`,
    orderCode: generateOrderCode(existing),
    customerId: input.customerId,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    deliveryAddressSnapshot: input.deliveryAddressSnapshot,
    paymentMethodCode: input.paymentMethodCode,
    paymentMethodLabel: input.paymentMethodLabel,
    deliveryMethodCode: input.deliveryMethodCode,
    deliveryMethodLabel: input.deliveryMethodLabel,
    items: input.items,
    statusHistory: [{ fromStatus: null, toStatus: "pending", changedAt: now, changedBy: "Khách hàng" }],
    subtotal,
    discount,
    deliveryFee,
    totalAmount: subtotal - discount + deliveryFee,
    orderStatus: "pending",
    paymentStatus: "pending",
    note: input.note,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    cancelledAt: null,
  };

  writeStore([...existing, order]);
  return order;
}

/**
 * Chỉ cho phép chuyển trạng thái hợp lệ theo ORDER_STATUS_TRANSITIONS
 * (state machine trung tâm) — chặn ở service layer, không chỉ ẩn nút ở UI.
 */
export async function updateOrderStatus(
  id: string,
  toStatus: OrderStatus,
  changedBy: string,
  note?: string,
): Promise<ManagedOrder> {
  await delay();
  const existing = readStore();
  const order = existing.find((item) => item.id === id);
  if (!order) {
    throw new Error(`Không tìm thấy đơn hàng: ${id}`);
  }

  const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.orderStatus];
  if (!allowedNextStatuses.includes(toStatus)) {
    throw new Error(`Không thể chuyển đơn hàng từ "${order.orderStatus}" sang "${toStatus}"`);
  }

  const now = new Date().toISOString();
  const updated: ManagedOrder = {
    ...order,
    orderStatus: toStatus,
    updatedAt: now,
    completedAt: toStatus === "completed" ? now : order.completedAt,
    cancelledAt: toStatus === "cancelled" ? now : order.cancelledAt,
    statusHistory: [
      ...order.statusHistory,
      { fromStatus: order.orderStatus, toStatus, changedAt: now, changedBy, note },
    ],
  };

  writeStore(existing.map((item) => (item.id === id ? updated : item)));
  return updated;
}

export async function updateOrderPaymentStatus(id: string, toStatus: PaymentStatus): Promise<ManagedOrder> {
  await delay();
  const existing = readStore();
  const order = existing.find((item) => item.id === id);
  if (!order) {
    throw new Error(`Không tìm thấy đơn hàng: ${id}`);
  }

  const updated: ManagedOrder = { ...order, paymentStatus: toStatus, updatedAt: new Date().toISOString() };
  writeStore(existing.map((item) => (item.id === id ? updated : item)));
  return updated;
}
