import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedPromotion, PromotionStatus, PromotionType } from "../types/promotion.types";

/**
 * Admin → Catalog → Mã giảm giá, gọi Backend /api/v1/catalog/promotions (quyền
 * promotions.*). Checkout (Site) kiểm tra mã qua promotion-validation.service.ts,
 * không qua file này.
 *
 * - `code` luôn được Backend chuẩn hóa IN HOA và phải duy nhất (409 nếu trùng).
 * - `applicableProductIds`/`applicableCategoryIds` chỉ dùng cho loại
 *   "product_discount" (bắt buộc có ít nhất 1); loại khác Backend bỏ qua.
 * - `usageCount` chỉ đọc: do module Orders (Backend) tăng khi có đơn hàng thật.
 */

/** PromotionResponse của Backend. */
type PromotionDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: PromotionType;
  value: number;
  maxDiscountAmount: number | null;
  minimumOrderAmount: number | null;
  startAt: string | null;
  endAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  status: Exclude<PromotionStatus, "expired">;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type PromotionFormValue = Omit<ManagedPromotion, "id" | "usageCount" | "createdAt" | "updatedAt">;

function toManagedPromotion(dto: PromotionDto): ManagedPromotion {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description ?? undefined,
    type: dto.type,
    value: dto.value,
    maxDiscountAmount: dto.maxDiscountAmount ?? undefined,
    minimumOrderAmount: dto.minimumOrderAmount ?? undefined,
    startAt: dto.startAt ?? undefined,
    endAt: dto.endAt ?? undefined,
    usageLimit: dto.usageLimit ?? undefined,
    usageCount: dto.usageCount,
    applicableProductIds: dto.applicableProductIds,
    applicableCategoryIds: dto.applicableCategoryIds,
    status: dto.status,
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc ?? dto.createdAtUtc,
  };
}

/** Bỏ các field chỉ đọc (id, usageCount, mốc thời gian) để dùng làm giá trị ban đầu của form sửa. */
export function toPromotionFormValue(promotion: ManagedPromotion): PromotionFormValue {
  return {
    code: promotion.code,
    name: promotion.name,
    description: promotion.description,
    type: promotion.type,
    value: promotion.value,
    maxDiscountAmount: promotion.maxDiscountAmount,
    minimumOrderAmount: promotion.minimumOrderAmount,
    startAt: promotion.startAt,
    endAt: promotion.endAt,
    usageLimit: promotion.usageLimit,
    applicableProductIds: promotion.applicableProductIds,
    applicableCategoryIds: promotion.applicableCategoryIds,
    status: promotion.status,
  };
}

function toRequest(payload: PromotionFormValue) {
  return {
    code: payload.code,
    name: payload.name,
    description: payload.description || null,
    type: payload.type,
    value: payload.value,
    maxDiscountAmount: payload.maxDiscountAmount ?? null,
    minimumOrderAmount: payload.minimumOrderAmount ?? null,
    startAt: payload.startAt ?? null,
    endAt: payload.endAt ?? null,
    usageLimit: payload.usageLimit ?? null,
    applicableProductIds: payload.applicableProductIds ?? [],
    applicableCategoryIds: payload.applicableCategoryIds ?? [],
    status: payload.status,
  };
}

export async function listPromotions(): Promise<ManagedPromotion[]> {
  const page = await adminApi.get<PaginatedResult<PromotionDto>>("/catalog/promotions", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedPromotion);
}

export async function getPromotionById(id: string): Promise<ManagedPromotion> {
  return toManagedPromotion(await adminApi.get<PromotionDto>(`/catalog/promotions/${id}`));
}

export async function createPromotion(payload: PromotionFormValue): Promise<ManagedPromotion> {
  return toManagedPromotion(await adminApi.post<PromotionDto>("/catalog/promotions", toRequest(payload)));
}

export async function updatePromotion(id: string, payload: PromotionFormValue): Promise<ManagedPromotion> {
  return toManagedPromotion(await adminApi.put<PromotionDto>(`/catalog/promotions/${id}`, toRequest(payload)));
}

export function deletePromotion(id: string): Promise<void> {
  return adminApi.delete<void>(`/catalog/promotions/${id}`);
}

/**
 * "expired" không lưu ở Backend — suy ra từ `endAt` tại thời điểm đọc, để
 * danh sách luôn phản ánh đúng thực tế dù Admin quên đổi trạng thái.
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
