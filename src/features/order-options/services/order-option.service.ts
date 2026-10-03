import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import { isApiError } from "@/lib/http/api-error";
import type { PaginatedResult } from "@/lib/http/api-types";
import { salesApi } from "@/lib/http/sales-api";

import type { ManagedOrderOptionGroup } from "../types/order-option.types";

/**
 * Tùy chọn chung của đơn hàng (Nước mắm, Rau...) — Backend module Sales (/api/v1/sales/order-option-groups, quyền
 * order-option-groups.*). Áp dụng cho TOÀN đơn, khác modifier của từng món (features/modifier-groups).
 *
 * - Admin (Cấu hình → Tùy chọn chung đơn hàng) gọi qua `adminApi`.
 * - Giỏ hàng/Checkout đọc qua `salesApi` (/public/order-options, không cần đăng nhập).
 *
 * Danh sách option gửi lên là đầy đủ, có thứ tự. Option đã có giữ nguyên id (đơn hàng tham chiếu optionId); option mới (id
 * bắt đầu bằng NEW_OPTION_ID_PREFIX, sinh ở Editor) gửi id = null để Backend cấp id. Phụ phí của option được cộng MỘT LẦN
 * cho cả đơn (không nhân số lượng).
 */
export const NEW_OPTION_ID_PREFIX = "new-";

export type OrderOptionGroupUpsertInput = Omit<ManagedOrderOptionGroup, "id" | "createdAt" | "updatedAt">;

function toRequest(payload: OrderOptionGroupUpsertInput) {
  return {
    name: payload.name,
    selectionType: payload.selectionType,
    isRequired: payload.isRequired,
    options: payload.options.map((option) => ({
      id: option.id.startsWith(NEW_OPTION_ID_PREFIX) ? null : option.id,
      label: option.label,
      priceAdjustment: option.priceAdjustment,
      isDefault: option.isDefault,
    })),
  };
}

/** Danh sách cho màn Admin. */
export async function listOrderOptionGroups(): Promise<ManagedOrderOptionGroup[]> {
  const page = await adminApi.get<PaginatedResult<ManagedOrderOptionGroup>>("/sales/order-option-groups", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items;
}

/** null khi không tồn tại (Backend 404). */
export async function getOrderOptionGroupById(id: string): Promise<ManagedOrderOptionGroup | null> {
  try {
    return await adminApi.get<ManagedOrderOptionGroup>(`/sales/order-option-groups/${id}`);
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/** Danh sách cho Giỏ hàng/Checkout (công khai) — không hard-code Nước mắm/Rau trong UI. */
export function listGeneralOrderOptions(): Promise<ManagedOrderOptionGroup[]> {
  return salesApi.get<ManagedOrderOptionGroup[]>("/public/order-options");
}

export function createOrderOptionGroup(payload: OrderOptionGroupUpsertInput): Promise<ManagedOrderOptionGroup> {
  return adminApi.post<ManagedOrderOptionGroup>("/sales/order-option-groups", toRequest(payload));
}

export function updateOrderOptionGroup(id: string, payload: OrderOptionGroupUpsertInput): Promise<ManagedOrderOptionGroup> {
  return adminApi.put<ManagedOrderOptionGroup>(`/sales/order-option-groups/${id}`, toRequest(payload));
}

export async function deleteOrderOptionGroup(id: string): Promise<void> {
  await adminApi.delete(`/sales/order-option-groups/${id}`);
}
