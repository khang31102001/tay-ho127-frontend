import type { ManagedDeliveryMethod } from "../types/delivery-method.types";

/**
 * MOCK CONTRACT: khớp mức phí đang dùng ở features/checkout (SHIPPING_FEES:
 * within_5km = 0, over_5km = 10_000), thêm 1 lựa chọn "pickup" để minh họa
 * Type = "pickup" (khác field set với "delivery").
 */
export const SEED_DELIVERY_METHODS: ManagedDeliveryMethod[] = [
  {
    id: "dm-1",
    code: "within_5km",
    name: "Giao trong bán kính 5km",
    description: "Miễn phí giao hàng trong bán kính 5km từ cửa hàng.",
    type: "delivery",
    baseFee: 0,
    estimatedMinMinutes: 20,
    estimatedMaxMinutes: 35,
    displayOrder: 1,
    isActive: true,
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "dm-2",
    code: "over_5km",
    name: "Giao ngoài bán kính 5km",
    description: "Áp dụng phí giao hàng cố định cho khoảng cách xa hơn 5km.",
    type: "delivery",
    baseFee: 10_000,
    estimatedMinMinutes: 35,
    estimatedMaxMinutes: 55,
    displayOrder: 2,
    isActive: true,
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "dm-3",
    code: "pickup",
    name: "Tự đến lấy tại cửa hàng",
    description: "Khách tự đến nhận hàng, không mất phí giao.",
    type: "pickup",
    baseFee: 0,
    pickupAddress: "127 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP. Hồ Chí Minh",
    estimatedMinMinutes: 10,
    estimatedMaxMinutes: 15,
    displayOrder: 3,
    isActive: true,
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
