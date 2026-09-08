import { getDeliveryMethodByCode, resolveDeliveryFee } from "@/features/delivery-methods";
import { getPaymentMethodByCode, isPaymentMethodEligible } from "@/features/payment-methods";
// Đi thẳng vào service của Catalog (không qua barrel Admin) — lý do xem
// features/menu/services/menu.service.ts. Đây là nguồn giá SẢN PHẨM duy nhất
// được tin cậy khi tạo Order (xem CreateOrderInput bên dưới).
import { getProductById } from "@/features/products/services/product.service";
import { listMedia } from "@/features/media/services/media.service";
import { getModifierGroupById } from "@/features/modifier-groups/services/modifier-group.service";

import { SEED_ORDERS } from "../mocks/order.mock";
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from "../types/order-status";
import type { PaymentStatus } from "../types/payment-status";
import type { OrderItem, OrderItemModifierSnapshot } from "../types/order-item.types";
import type { ManagedOrder } from "../types/order.types";
import { generateOrderCode } from "../utils/order-code";

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

export async function listOrders(): Promise<ManagedOrder[]> {
  await delay();
  return [...readStore()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(id: string): Promise<ManagedOrder | undefined> {
  await delay();
  return readStore().find((order) => order.id === id);
}

/** Dùng bởi Order Tracking (Site) — route /don-hang/[orderCode] tra theo mã công khai, không dùng id nội bộ. */
export async function getOrderByCode(orderCode: string): Promise<ManagedOrder | undefined> {
  await delay();
  return readStore().find((order) => order.orderCode === orderCode);
}

/** Dùng bởi Order History (Site, /tai-khoan/don-hang) — chỉ trả Order của đúng customerId đã đăng nhập, mới nhất trước. */
export async function listCustomerOrders(customerId: string): Promise<ManagedOrder[]> {
  await delay();
  return readStore()
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Chỉ gửi groupId + optionId — KHÔNG gửi label/priceAdjustment (giống
 * paymentMethodCode/deliveryMethodCode: service tự tra cứu lại giá/nhãn thật
 * từ features/modifier-groups, không tin dữ liệu hiển thị do Frontend gửi lên).
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
  /** Mã giảm giá khách đã áp dụng ở Checkout (nếu có) — lưu nguyên vào Order để tra cứu/đối soát sau này, KHÔNG dùng để tính lại `discount` (Checkout đã tính sẵn amount, service chỉ lưu lại). */
  discountCode?: string;
  promotionId?: string;
  /** Order Preference — áp dụng cho toàn đơn, không thuộc từng CartItem. */
  wantsUtensils: boolean;
  note?: string;
  /** Sinh 1 lần phía Client cho mỗi lượt Checkout (giữ nguyên qua các lần thử lại) — chống double-submit, xem createOrder(). */
  idempotencyKey?: string;
};

/**
 * Tra cứu lại nhóm/lựa chọn modifier thật từ features/modifier-groups theo
 * groupId/optionId — KHÔNG tin groupName/optionLabel/priceAdjustment do
 * Frontend gửi (Cart ở localStorage, có thể bị chỉnh sửa). Bỏ qua âm thầm
 * modifier không còn tồn tại/group không còn option đó thay vì throw — dữ
 * liệu modifier Admin có thể đã đổi giữa lúc khách xem trang và lúc đặt hàng,
 * không nên chặn toàn bộ đơn hàng chỉ vì 1 modifier lỗi thời.
 */
async function resolveOrderItemModifiers(
  modifierInputs: CreateOrderItemModifierInput[] | undefined,
): Promise<OrderItemModifierSnapshot[]> {
  if (!modifierInputs || modifierInputs.length === 0) {
    return [];
  }

  const snapshots = await Promise.all(
    modifierInputs.map(async (input) => {
      const group = await getModifierGroupById(input.groupId);
      const option = group?.options.find((candidate) => candidate.id === input.optionId);
      if (!group || !option) {
        return null;
      }

      const snapshot: OrderItemModifierSnapshot = {
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionLabel: option.label,
        priceAdjustment: option.priceAdjustment,
      };
      return snapshot;
    }),
  );

  return snapshots.filter((snapshot): snapshot is OrderItemModifierSnapshot => snapshot !== null);
}

/**
 * Tra cứu lại tên/ảnh/đơn giá thật từ Catalog (features/products) theo
 * productId — KHÔNG tin unitPrice/productName do Frontend (giỏ hàng ở
 * localStorage, có thể bị chỉnh sửa) gửi lên. Đây là nơi duy nhất quyết
 * định giá một dòng hàng khi tạo Order — bao gồm cả phần cộng thêm từ
 * modifier đã chọn (resolveOrderItemModifiers), không tin priceAdjustment
 * Frontend gửi.
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
      const modifiers = await resolveOrderItemModifiers(input.modifiers);
      const modifiersTotal = modifiers.reduce((sum, modifier) => sum + modifier.priceAdjustment, 0);

      const item: OrderItem = {
        productId: product.id,
        productName: product.name,
        productImage: media?.url ?? DEFAULT_PRODUCT_IMAGE,
        unitPrice: product.price,
        quantity: input.quantity,
        lineTotal: (product.price + modifiersTotal) * input.quantity,
        note: input.note,
        modifiers: modifiers.length > 0 ? modifiers : undefined,
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

  // Idempotency (#27): cùng idempotencyKey (double click, submit lại sau mất
  // mạng...) trả lại chính Order đã tạo trước đó, KHÔNG tạo Order thứ 2 —
  // kiểm tra trước cả resolveOrderItems để không tốn công tính lại giá.
  if (input.idempotencyKey) {
    const alreadyCreated = existing.find((order) => order.idempotencyKey === input.idempotencyKey);
    if (alreadyCreated) {
      return alreadyCreated;
    }
  }

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
    idempotencyKey: input.idempotencyKey,
    customerId: input.customerId,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    deliveryAddressSnapshot: input.deliveryAddressSnapshot,
    paymentMethodCode: paymentMethod.code,
    paymentMethodLabel: paymentMethod.name,
    deliveryMethodCode: deliveryMethod.code,
    deliveryMethodLabel: deliveryMethod.name,
    isPickup: deliveryMethod.type === "pickup",
    items,
    statusHistory: [{ fromStatus: null, toStatus: "pending", changedAt: now, changedBy: "Khách hàng" }],
    subtotal,
    discount,
    discountCode: input.discountCode,
    promotionId: input.promotionId,
    deliveryFee,
    totalAmount: subtotal - discount + deliveryFee,
    orderStatus: "pending",
    paymentStatus: "pending",
    wantsUtensils: input.wantsUtensils,
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
