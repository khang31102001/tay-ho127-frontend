import type { ManagedPromotion } from "../types/promotion.types";

/**
 * Seed demo — bám theo đúng 4 ví dụ nghiệp vụ trong yêu cầu (WELCOME20/
 * GIAM30K/FREESHIP/BANHCUON10). `applicableCategoryIds` của BANHCUON10 trỏ
 * tới id thật trong SEED_CATEGORIES (features/categories) — "cat-food-banh-cuon".
 */
export const SEED_PROMOTIONS: ManagedPromotion[] = [
  {
    id: "promo-welcome20",
    code: "WELCOME20",
    name: "Giảm 20% đơn hàng",
    description: "Giảm 20%, tối đa 50.000đ cho đơn từ 150.000đ.",
    type: "percentage",
    value: 20,
    maxDiscountAmount: 50000,
    minimumOrderAmount: 150000,
    usageLimit: 200,
    usageCount: 0,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "promo-giam30k",
    code: "GIAM30K",
    name: "Giảm 30.000đ",
    description: "Giảm ngay 30.000đ cho mọi đơn hàng.",
    type: "fixed_amount",
    value: 30000,
    minimumOrderAmount: 100000,
    usageCount: 0,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "promo-freeship",
    code: "FREESHIP",
    name: "Miễn phí vận chuyển",
    description: "Miễn phí toàn bộ phí giao hàng cho đơn từ 200.000đ.",
    type: "free_shipping",
    value: 100,
    minimumOrderAmount: 200000,
    usageCount: 0,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "promo-banhcuon10",
    code: "BANHCUON10",
    name: "Giảm 10% Bánh cuốn",
    description: "Giảm 10% các sản phẩm thuộc danh mục Bánh cuốn.",
    type: "product_discount",
    value: 10,
    maxDiscountAmount: 20000,
    applicableCategoryIds: ["cat-food-banh-cuon"],
    usageCount: 0,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
