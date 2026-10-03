import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import { isApiError } from "@/lib/http/api-error";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedPromotion } from "../types/promotion.types";

/**
 * Admin → Catalog → Mã giảm giá, gọi Backend /api/v1/catalog/promotions (quyền promotions.*).
 *
 * - `code` được Backend chuẩn hóa IN HOA, duy nhất (409 nếu trùng); "product_discount" bắt buộc có sản phẩm/danh mục áp dụng.
 * - `usageCount` do Backend tăng khi một đơn dùng mã (nguyên tử, chặn vượt `usageLimit` khi nhiều đơn cùng lúc) và giảm lại khi
 *   đơn bị hủy — Admin không sửa tay.
 * - Khách nhập mã ở Checkout: xem site-promotion.service.ts. Số tiền giảm của đơn hàng LUÔN do Backend tính lại khi đặt đơn.
 */

/** PromotionResponse của Backend. */
type PromotionDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: ManagedPromotion["type"];
  value: number;
  maxDiscountAmount: number | null;
  minimumOrderAmount: number | null;
  startAt: string | null;
  endAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  status: Exclude<ManagedPromotion["status"], "expired">;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

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

export type PromotionFormValue = Omit<ManagedPromotion, "id" | "usageCount" | "createdAt" | "updatedAt">;

/** Body gửi Backend — chỉ các field Admin được sửa (không gửi id/usageCount/dấu thời gian). */
function toRequest(payload: PromotionFormValue) {
  return {
    code: payload.code,
    name: payload.name,
    description: payload.description,
    type: payload.type,
    value: payload.value,
    maxDiscountAmount: payload.maxDiscountAmount,
    minimumOrderAmount: payload.minimumOrderAmount,
    startAt: payload.startAt,
    endAt: payload.endAt,
    usageLimit: payload.usageLimit,
    applicableProductIds: payload.applicableProductIds,
    applicableCategoryIds: payload.applicableCategoryIds,
    status: payload.status,
  };
}

export async function listPromotions(): Promise<ManagedPromotion[]> {
  const page = await adminApi.get<PaginatedResult<PromotionDto>>("/catalog/promotions", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedPromotion);
}

/** null khi không tồn tại (Backend 404). */
export async function getPromotionById(id: string): Promise<ManagedPromotion | null> {
  try {
    return toManagedPromotion(await adminApi.get<PromotionDto>(`/catalog/promotions/${id}`));
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

export async function createPromotion(payload: PromotionFormValue): Promise<ManagedPromotion> {
  return toManagedPromotion(await adminApi.post<PromotionDto>("/catalog/promotions", toRequest(payload)));
}

export async function updatePromotion(id: string, payload: PromotionFormValue): Promise<ManagedPromotion> {
  return toManagedPromotion(await adminApi.put<PromotionDto>(`/catalog/promotions/${id}`, toRequest(payload)));
}

export async function deletePromotion(id: string): Promise<void> {
  await adminApi.delete(`/catalog/promotions/${id}`);
}

/**
 * "expired" không phải field Admin tự set tay — suy ra từ `endAt` tại thời điểm đọc, để danh sách Explorer luôn phản ánh đúng
 * thực tế dù Admin quên cập nhật status thủ công. (Backend cũng tự coi mã quá hạn là không dùng được khi kiểm tra.)
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
