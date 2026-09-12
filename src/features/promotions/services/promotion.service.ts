// Đi thẳng vào service của Catalog (không qua barrel Admin — barrel còn
// re-export "use client" Explorer/Editor) — promotion.service.ts được
// discount-code.service.ts (Checkout, site công khai) import trực tiếp, giống
// lý do order.service.ts đi thẳng vào product.service.ts/category.service.ts.
import { getProductById } from "@/features/products/services/product.service";
import { listCategories } from "@/features/categories/services/category.service";
import type { ManagedCategory } from "@/features/categories/types/category.types";
import { formatCurrency } from "@/lib/format-currency";

import type {
  ManagedPromotion,
  PromotionValidateRequest,
  PromotionValidationResult,
} from "../types/promotion.types";
import { SEED_PROMOTIONS } from "../mocks/promotion.mock";

/**
 * MOCK CONTRACT — chưa có Backend Promotion thật. Dữ liệu seed (xem
 * ../mocks/promotion.mock.ts) + đồng bộ 2 chiều với localStorage, giống hệt
 * pattern category.service.ts/product.service.ts. API dự kiến khi có Backend
 * thật:
 *   GET    /api/promotions
 *   GET    /api/promotions/{id}
 *   POST   /api/promotions
 *   PUT    /api/promotions/{id}
 *   DELETE /api/promotions/{id}
 *   POST   /api/promotions/validate
 * Khi thay Backend thật, chỉ cần sửa nội dung các hàm dưới đây — chữ ký hàm
 * và shape ManagedPromotion/PromotionValidationResult giữ nguyên để
 * component/Checkout không phải sửa lại.
 */
const STORAGE_KEY = "tayho-admin-promotions";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedPromotion[] {
  if (typeof window === "undefined") {
    return SEED_PROMOTIONS;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedPromotion[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu mã giảm giá admin:", error);
  }

  return SEED_PROMOTIONS;
}

function writeStore(promotions: ManagedPromotion[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(promotions));
  } catch (error) {
    console.error("Không thể lưu dữ liệu mã giảm giá admin:", error);
  }
}

export async function listPromotions(): Promise<ManagedPromotion[]> {
  await delay();
  return readStore();
}

export async function getPromotionById(id: string): Promise<ManagedPromotion | null> {
  await delay();
  return readStore().find((promotion) => promotion.id === id) ?? null;
}

export type PromotionFormValue = Omit<ManagedPromotion, "id" | "usageCount" | "createdAt" | "updatedAt">;

export async function createPromotion(payload: PromotionFormValue): Promise<ManagedPromotion> {
  await delay();

  const now = new Date().toISOString();
  const newPromotion: ManagedPromotion = {
    ...payload,
    id: `promo-${Date.now()}`,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  writeStore([...readStore(), newPromotion]);

  return newPromotion;
}

export async function updatePromotion(id: string, payload: PromotionFormValue): Promise<ManagedPromotion> {
  await delay();

  const existing = readStore().find((promotion) => promotion.id === id);
  if (!existing) {
    throw new Error("Không tìm thấy mã giảm giá.");
  }

  const updatedPromotion: ManagedPromotion = {
    ...existing,
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  };

  writeStore(readStore().map((promotion) => (promotion.id === id ? updatedPromotion : promotion)));

  return updatedPromotion;
}

export async function deletePromotion(id: string): Promise<void> {
  await delay();
  writeStore(readStore().filter((promotion) => promotion.id !== id));
}

/**
 * "expired" không phải field Admin tự set tay — suy ra từ `endAt` tại thời
 * điểm đọc, để danh sách Explorer/validatePromotion luôn phản ánh đúng thực
 * tế dù Admin quên cập nhật status thủ công.
 */
export function resolvePromotionEffectiveStatus(
  promotion: ManagedPromotion,
  now: Date = new Date(),
): ManagedPromotion["status"] {
  if (promotion.status === "draft" || promotion.status === "inactive") {
    return promotion.status;
  }

  if (promotion.endAt && now.getTime() > new Date(promotion.endAt).getTime()) {
    return "expired";
  }

  return "active";
}

/** Ghi nhận 1 lượt sử dụng — gọi khi Order thật sự được tạo (không phải lúc chỉ "áp dụng thử" ở Checkout), xem features/orders/services/order.service.ts. */
export async function incrementPromotionUsage(id: string): Promise<void> {
  await delay();

  const promotion = readStore().find((item) => item.id === id);
  if (!promotion) {
    return;
  }

  writeStore(
    readStore().map((item) => (item.id === id ? { ...item, usageCount: item.usageCount + 1 } : item)),
  );
}

function normalizeCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

/**
 * Category là cây 3 tầng group → category → subCategory qua `parentId` (xem
 * SEED_CATEGORIES, features/categories) — Product chỉ gắn `categoryId` vào
 * tầng lá (subCategory), nên "áp dụng cho danh mục Bánh cuốn" (tầng giữa)
 * phải tính luôn các subCategory con, không chỉ so khớp categoryId trực tiếp.
 * Trả về chính categoryId + toàn bộ id tổ tiên của nó.
 */
function resolveCategoryAncestryIds(categoryId: string, categoriesById: Map<string, ManagedCategory>): string[] {
  const ancestry: string[] = [];
  let current: string | null = categoryId;

  while (current) {
    ancestry.push(current);
    current = categoriesById.get(current)?.parentId ?? null;
  }

  return ancestry;
}

/**
 * Chỉ tính discount cho các dòng hàng thuộc `applicableProductIds`/
 * `applicableCategoryIds` — tra cứu lại categoryId thật từ Catalog
 * (features/products) theo productId, không tin category do Frontend gửi lên.
 */
async function calculateEligibleSubtotal(
  promotion: ManagedPromotion,
  items: PromotionValidateRequest["items"],
): Promise<number> {
  const productIds = promotion.applicableProductIds ?? [];
  const categoryIds = promotion.applicableCategoryIds ?? [];

  const categoriesById =
    categoryIds.length > 0
      ? new Map((await listCategories()).map((category) => [category.id, category]))
      : new Map<string, ManagedCategory>();

  const eligibleFlags = await Promise.all(
    items.map(async (item) => {
      if (productIds.includes(item.productId)) {
        return true;
      }

      if (categoryIds.length === 0) {
        return false;
      }

      const product = await getProductById(item.productId);
      if (!product) {
        return false;
      }

      const ancestry = resolveCategoryAncestryIds(product.categoryId, categoriesById);
      return ancestry.some((id) => categoryIds.includes(id));
    }),
  );

  return items.reduce((sum, item, index) => (eligibleFlags[index] ? sum + item.lineTotal : sum), 0);
}

const INVALID_RESULT_BASE = { isValid: false as const, discountAmount: 0, shippingDiscount: 0 };

/**
 * Business rule DUY NHẤT của Promotion — validate điều kiện + tính sẵn
 * discountAmount/shippingDiscount. Checkout/UI KHÔNG được tự tính lại hay
 * hard-code điều kiện mã (xem features/checkout/services/discount-code.service.ts,
 * nơi duy nhất gọi hàm này từ phía Checkout).
 */
export async function validatePromotion(request: PromotionValidateRequest): Promise<PromotionValidationResult> {
  await delay();

  const code = normalizeCode(request.code);
  if (!code) {
    return { ...INVALID_RESULT_BASE, message: "Vui lòng nhập mã giảm giá." };
  }

  const promotion = readStore().find((item) => normalizeCode(item.code) === code);
  if (!promotion) {
    return { ...INVALID_RESULT_BASE, message: "Mã giảm giá không tồn tại hoặc đã bị xóa." };
  }

  const effectiveStatus = resolvePromotionEffectiveStatus(promotion);
  if (effectiveStatus === "draft" || effectiveStatus === "inactive") {
    return { ...INVALID_RESULT_BASE, message: "Mã giảm giá hiện không khả dụng." };
  }
  if (effectiveStatus === "expired") {
    return { ...INVALID_RESULT_BASE, message: "Mã giảm giá đã hết hạn." };
  }

  if (promotion.startAt && Date.now() < new Date(promotion.startAt).getTime()) {
    return { ...INVALID_RESULT_BASE, message: "Mã giảm giá chưa đến ngày áp dụng." };
  }

  if (promotion.usageLimit !== undefined && promotion.usageCount >= promotion.usageLimit) {
    return { ...INVALID_RESULT_BASE, message: "Mã giảm giá đã hết lượt sử dụng." };
  }

  if (promotion.minimumOrderAmount && request.subtotal < promotion.minimumOrderAmount) {
    return {
      ...INVALID_RESULT_BASE,
      message: `Đơn hàng cần tối thiểu ${formatCurrency(promotion.minimumOrderAmount)} để áp dụng mã này.`,
    };
  }

  const promotionSummary = { id: promotion.id, code: promotion.code, name: promotion.name, type: promotion.type };

  if (promotion.type === "percentage" || promotion.type === "fixed_amount") {
    const rawDiscount =
      promotion.type === "percentage"
        ? Math.round((request.subtotal * promotion.value) / 100)
        : promotion.value;
    const cappedDiscount = promotion.maxDiscountAmount
      ? Math.min(rawDiscount, promotion.maxDiscountAmount)
      : rawDiscount;

    return {
      isValid: true,
      promotion: promotionSummary,
      discountAmount: Math.min(cappedDiscount, request.subtotal),
      shippingDiscount: 0,
    };
  }

  if (promotion.type === "free_shipping") {
    const shippingDiscount = Math.min(
      Math.round((request.shippingFee * promotion.value) / 100),
      request.shippingFee,
    );

    return {
      isValid: true,
      promotion: promotionSummary,
      discountAmount: 0,
      shippingDiscount,
    };
  }

  // product_discount
  const eligibleSubtotal = await calculateEligibleSubtotal(promotion, request.items);
  if (eligibleSubtotal <= 0) {
    return {
      ...INVALID_RESULT_BASE,
      message: "Mã giảm giá không áp dụng cho sản phẩm nào trong giỏ hàng của bạn.",
    };
  }

  const rawDiscount = Math.round((eligibleSubtotal * promotion.value) / 100);
  const cappedDiscount = promotion.maxDiscountAmount
    ? Math.min(rawDiscount, promotion.maxDiscountAmount)
    : rawDiscount;

  return {
    isValid: true,
    promotion: promotionSummary,
    discountAmount: Math.min(cappedDiscount, eligibleSubtotal),
    shippingDiscount: 0,
  };
}
