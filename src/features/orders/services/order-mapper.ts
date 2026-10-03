import { listMedia } from "@/features/media/services/public-media.service";

import type { OrderItem, OrderItemModifierSnapshot } from "../types/order-item.types";
import type { OrderStatus } from "../types/order-status";
import type { PaymentStatus } from "../types/payment-status";
import type { OrderStatusHistoryEntry } from "../types/order-status-history.types";
import type { ManagedOrder } from "../types/order.types";

/**
 * Dịch OrderResponse của Backend (/api/v1/sales/...) sang ManagedOrder mà UI dùng — dùng chung cho Admin và Site. Đơn là
 * SNAPSHOT lúc đặt (tên/giá/nhãn), Backend là nơi tính mọi con số: UI không tự tính lại.
 */

/** OrderResponse của Backend. */
export type OrderDto = {
  id: string;
  orderCode: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  deliveryAddressSnapshot: string;
  paymentMethodCode: string;
  paymentMethodLabel: string;
  deliveryMethodCode: string;
  deliveryMethodLabel: string;
  isPickup: boolean;
  items: Array<{
    productId: string;
    productName: string;
    /** Id media của ảnh món lúc đặt — đổi sang URL bằng danh sách media công khai. */
    productImage: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    note: string | null;
    modifiers: OrderItemModifierSnapshot[];
  }>;
  orderOptionSelections: OrderItemModifierSnapshot[];
  statusHistory: Array<{
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    changedAt: string;
    changedBy: string;
    note: string | null;
  }>;
  subtotal: number;
  discount: number;
  discountCode: string | null;
  promotionId: string | null;
  shippingDiscount: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  wantsUtensils: boolean;
  note: string | null;
  nextStatuses: OrderStatus[];
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
};

/** Ảnh dự phòng khi món không có ảnh (hoặc media không còn trên Site). */
export const DEFAULT_PRODUCT_IMAGE = "/images/banh-cuon-dish.jpg";

type ImageResolver = (mediaId: string | null) => string;

async function createImageResolver(): Promise<ImageResolver> {
  const media = await listMedia();
  const urlById = new Map(media.map((item) => [item.id, item.url]));
  return (mediaId) => (mediaId ? (urlById.get(mediaId) ?? DEFAULT_PRODUCT_IMAGE) : DEFAULT_PRODUCT_IMAGE);
}

function toManagedOrder(dto: OrderDto, resolveImage: ImageResolver): ManagedOrder {
  const items: OrderItem[] = dto.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: resolveImage(item.productImage),
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    note: item.note ?? undefined,
    modifiers: item.modifiers.length > 0 ? item.modifiers : undefined,
  }));

  const statusHistory: OrderStatusHistoryEntry[] = dto.statusHistory.map((entry) => ({
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedAt: entry.changedAt,
    changedBy: entry.changedBy,
    note: entry.note ?? undefined,
  }));

  return {
    id: dto.id,
    orderCode: dto.orderCode,
    customerId: dto.customerId,
    customerName: dto.customerName,
    phone: dto.phone,
    email: dto.email ?? undefined,
    deliveryAddressSnapshot: dto.deliveryAddressSnapshot,
    paymentMethodCode: dto.paymentMethodCode,
    paymentMethodLabel: dto.paymentMethodLabel,
    deliveryMethodCode: dto.deliveryMethodCode,
    deliveryMethodLabel: dto.deliveryMethodLabel,
    isPickup: dto.isPickup,
    items,
    statusHistory,
    subtotal: dto.subtotal,
    discount: dto.discount,
    discountCode: dto.discountCode ?? undefined,
    promotionId: dto.promotionId ?? undefined,
    shippingDiscount: dto.shippingDiscount,
    deliveryFee: dto.deliveryFee,
    totalAmount: dto.totalAmount,
    orderStatus: dto.orderStatus,
    paymentStatus: dto.paymentStatus,
    wantsUtensils: dto.wantsUtensils,
    note: dto.note ?? undefined,
    orderOptionSelections: dto.orderOptionSelections,
    nextStatuses: dto.nextStatuses,
    paymentId: dto.paymentId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    completedAt: dto.completedAt,
    cancelledAt: dto.cancelledAt,
  };
}

export async function toManagedOrders(dtos: OrderDto[]): Promise<ManagedOrder[]> {
  if (dtos.length === 0) {
    return [];
  }
  const resolveImage = await createImageResolver();
  return dtos.map((dto) => toManagedOrder(dto, resolveImage));
}

export async function toManagedOrderSingle(dto: OrderDto): Promise<ManagedOrder> {
  const [order] = await toManagedOrders([dto]);
  return order;
}
