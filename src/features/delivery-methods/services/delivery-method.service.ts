import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";
import { isApiError } from "@/lib/http/api-error";
import { salesApi } from "@/lib/http/sales-api";

import type { DeliveryMethodType, ManagedDeliveryMethod } from "../types/delivery-method.types";

/**
 * Phương thức giao hàng — Backend module Sales (/api/v1/sales/delivery-methods, quyền delivery-methods.*).
 *
 * - Admin (Cấu hình → Phương thức giao hàng) gọi qua `adminApi`.
 * - Site (Giỏ hàng/Checkout) đọc danh sách ĐANG BẬT, không cần đăng nhập, qua `salesApi` (/public/delivery-methods).
 * - `code` bất biến sau khi tạo (đơn hàng và Site tham chiếu theo code). Backend tự tính lại phí khi tạo đơn — con số
 *   `resolveDeliveryFee` ở đây chỉ để HIỂN THỊ ở giỏ hàng, không phải nguồn tin cậy.
 */

/** DeliveryMethodResponse của Backend. */
type DeliveryMethodDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: DeliveryMethodType;
  baseFee: number;
  freeShippingThreshold: number | null;
  estimatedMinMinutes: number | null;
  estimatedMaxMinutes: number | null;
  pickupAddress: string | null;
  displayOrder: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

/** PublicDeliveryMethodResponse của Backend — chỉ phương thức đang bật, không có dấu thời gian. */
type PublicDeliveryMethodDto = Omit<DeliveryMethodDto, "isActive" | "createdAt" | "updatedAt">;

function toManagedDeliveryMethod(dto: DeliveryMethodDto | PublicDeliveryMethodDto): ManagedDeliveryMethod {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description ?? undefined,
    type: dto.type,
    baseFee: dto.baseFee,
    freeShippingThreshold: dto.freeShippingThreshold ?? undefined,
    estimatedMinMinutes: dto.estimatedMinMinutes ?? undefined,
    estimatedMaxMinutes: dto.estimatedMaxMinutes ?? undefined,
    pickupAddress: dto.pickupAddress ?? undefined,
    displayOrder: dto.displayOrder,
    // Endpoint công khai chỉ trả phương thức đang bật và không trả dấu thời gian.
    isActive: "isActive" in dto ? dto.isActive : true,
    isDefault: dto.isDefault,
    createdAt: "createdAt" in dto ? dto.createdAt : "",
    updatedAt: "updatedAt" in dto ? dto.updatedAt : "",
  };
}

export async function listDeliveryMethods(): Promise<ManagedDeliveryMethod[]> {
  const page = await adminApi.get<PaginatedResult<DeliveryMethodDto>>("/sales/delivery-methods", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedDeliveryMethod);
}

/** null khi không tồn tại (Backend 404). */
export async function getDeliveryMethodById(id: string): Promise<ManagedDeliveryMethod | null> {
  try {
    return toManagedDeliveryMethod(await adminApi.get<DeliveryMethodDto>(`/sales/delivery-methods/${id}`));
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/**
 * Công thức tính phí giao hàng cho giỏ hàng — chỉ để HIỂN THỊ (Backend tính lại khi tạo đơn bằng đúng công thức này).
 */
export function resolveDeliveryFee(method: ManagedDeliveryMethod, subtotal: number): number {
  if (method.freeShippingThreshold !== undefined && subtotal >= method.freeShippingThreshold) {
    return 0;
  }
  return method.baseFee;
}

/** Phương thức đang bật theo thứ tự hiển thị — Giỏ hàng/Checkout PHẢI gọi hàm này, không hard-code phương thức trong UI. */
export async function listAvailableDeliveryMethods(): Promise<ManagedDeliveryMethod[]> {
  const methods = await salesApi.get<PublicDeliveryMethodDto[]>("/public/delivery-methods");
  return methods.map(toManagedDeliveryMethod);
}

export type DeliveryMethodUpsertInput = Omit<ManagedDeliveryMethod, "id" | "createdAt" | "updatedAt">;

export async function createDeliveryMethod(payload: DeliveryMethodUpsertInput): Promise<ManagedDeliveryMethod> {
  return toManagedDeliveryMethod(await adminApi.post<DeliveryMethodDto>("/sales/delivery-methods", payload));
}

/** `code` trong payload bị Backend bỏ qua (bất biến). */
export async function updateDeliveryMethod(id: string, payload: DeliveryMethodUpsertInput): Promise<ManagedDeliveryMethod> {
  return toManagedDeliveryMethod(await adminApi.put<DeliveryMethodDto>(`/sales/delivery-methods/${id}`, payload));
}

export async function deleteDeliveryMethod(id: string): Promise<void> {
  await adminApi.delete(`/sales/delivery-methods/${id}`);
}
