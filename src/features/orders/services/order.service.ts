import { getDeliveryMethodByCode, resolveDeliveryFee } from "@/features/delivery-methods";
import { getPaymentMethodByCode, isPaymentMethodEligible } from "@/features/payment-methods";
// Đi thẳng vào service của Catalog (không qua barrel Admin) — lý do xem
// features/menu/services/menu.service.ts. Đây là nguồn giá SẢN PHẨM duy nhất
// được tin cậy khi tạo Order (xem CreateOrderInput bên dưới).
import { getProductById } from "@/features/products/services/product.service";
import { listMedia } from "@/features/media/services/media.service";

import { SEED_ORDERS } from "../mocks/order.mock";
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from "../types/order-status";
import type { PaymentStatus } from "../types/payment-status";
import type { OrderItem } from "../types/order-item.types";
import type { ManagedOrder } from "../types/order.types";

const STORAGE_KEY = "tayho-admin-orders";
const MOCK_DELAY_MS = 300;
const DEFAULT_PRODUCT_IMAGE = "/images/banh-cuon-dish.jpg";

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

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
  note?: string;
};

export type CreateOrderInput = {
  customerId: string | null;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddressSnapshot: string;
  /** Chỉ truyền code — nhãn hiển thị và phí giao hàng do service tự tra cứu lại, không tin Frontend. */
  paymentMethodCode: string;
  deliveryMethodCode: string;
  /** Chỉ truyền productId + quantity — tên/ảnh/đơn giá do service tự tra cứu lại từ Catalog, không tin Frontend. */
  items: CreateOrderItemInput[];
  discount?: number;
  note?: string;
};

/**
 * Tra cứu lại tên/ảnh/đơn giá thật từ Catalog (features/products) theo
 * productId — KHÔNG tin unitPrice/productName do Frontend (giỏ hàng ở
 * localStorage, có thể bị chỉnh sửa) gửi lên. Đây là nơi duy nhất quyết
 * định giá một dòng hàng khi tạo Order.
 */
async function resolveOrderItems(itemInputs: CreateOrderItemInput[]): Promise<OrderItem[]> {
  const mediaList = await listMedia();
  const mediaById = new Map(mediaList.map((media) => [media.id, media]));

  return Promise.all(
    itemInputs.map(async (input) => {
      if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
        throw new Error("Số lượng sản phẩm không hợp lệ.");
      }

      const product = await getProductById(input.productId);
      if (!product || product.status !== "active") {
        throw new Error(`Sản phẩm không khả dụng: ${input.productId}`);
      }

      const media = product.mediaIds[0] ? mediaById.get(product.mediaIds[0]) : undefined;

      const item: OrderItem = {
        productId: product.id,
        productName: product.name,
        productImage: media?.url ?? DEFAULT_PRODUCT_IMAGE,
        unitPrice: product.price,
        quantity: input.quantity,
        lineTotal: product.price * input.quantity,
        note: input.note,
      };
      return item;
    }),
  );
}

/**
 * Backend/API phải tính lại tổng tiền — không tin subtotal/totalAmount/phí
 * giao hàng/đơn giá sản phẩm gửi từ Frontend. Hàm này tự tra cứu lại từng
 * dòng hàng từ Catalog (resolveOrderItems), tự cộng lại subtotal, và tự tra
 * cứu PaymentMethod/DeliveryMethod theo code (thay vì tin fee/label do
 * Checkout gửi lên) để tính deliveryFee + validate điều kiện áp dụng.
 */
export async function createOrder(input: CreateOrderInput): Promise<ManagedOrder> {
  await delay();
  const existing = readStore();
  const now = new Date().toISOString();
  const items = await resolveOrderItems(input.items);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = input.discount ?? 0;

  const deliveryMethod = await getDeliveryMethodByCode(input.deliveryMethodCode);
  if (!deliveryMethod || !deliveryMethod.isActive) {
    throw new Error("Phương thức giao hàng không khả dụng.");
  }
  const deliveryFee = resolveDeliveryFee(deliveryMethod, subtotal);

  const paymentMethod = await getPaymentMethodByCode(input.paymentMethodCode);
  if (!paymentMethod || !paymentMethod.isActive) {
    throw new Error("Phương thức thanh toán không khả dụng.");
  }
  if (!isPaymentMethodEligible(paymentMethod, subtotal)) {
    throw new Error("Đơn hàng không đủ điều kiện áp dụng phương thức thanh toán này.");
  }

  const order: ManagedOrder = {
    id: `order-${Date.now()}`,
    orderCode: generateOrderCode(existing),
    customerId: input.customerId,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    deliveryAddressSnapshot: input.deliveryAddressSnapshot,
    paymentMethodCode: paymentMethod.code,
    paymentMethodLabel: paymentMethod.name,
    deliveryMethodCode: deliveryMethod.code,
    deliveryMethodLabel: deliveryMethod.name,
    items,
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
