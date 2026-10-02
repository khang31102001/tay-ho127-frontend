import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedModifierGroup, ModifierOption, ModifierSelectionType } from "../types/modifier-group.types";

/**
 * Admin → Catalog → Tùy chọn món (Modifier), gọi Backend
 * /api/v1/catalog/modifier-groups (quyền modifier-groups.*). Site đọc nhóm
 * tùy chọn qua features/catalog-public.
 *
 * Option gửi lên là danh sách đầy đủ, có thứ tự. Option đã có giữ nguyên id
 * (giỏ hàng/đơn hàng tham chiếu optionId); option mới (id bắt đầu bằng
 * NEW_OPTION_ID_PREFIX, sinh ở Editor) gửi id = null để Backend cấp id.
 */
export const NEW_OPTION_ID_PREFIX = "new-";

/** ModifierGroupResponse của Backend. */
type ModifierGroupDto = {
  id: string;
  name: string;
  selectionType: ModifierSelectionType;
  isRequired: boolean;
  options: ModifierOption[];
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

function toManagedModifierGroup(dto: ModifierGroupDto): ManagedModifierGroup {
  return {
    id: dto.id,
    name: dto.name,
    selectionType: dto.selectionType,
    isRequired: dto.isRequired,
    options: dto.options,
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc ?? dto.createdAtUtc,
  };
}

export type ModifierGroupUpsertInput = Omit<ManagedModifierGroup, "id" | "createdAt" | "updatedAt">;

function toRequest(payload: ModifierGroupUpsertInput) {
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

export async function listModifierGroups(): Promise<ManagedModifierGroup[]> {
  const page = await adminApi.get<PaginatedResult<ModifierGroupDto>>("/catalog/modifier-groups", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedModifierGroup);
}

export async function getModifierGroupById(id: string): Promise<ManagedModifierGroup> {
  return toManagedModifierGroup(await adminApi.get<ModifierGroupDto>(`/catalog/modifier-groups/${id}`));
}

export async function createModifierGroup(payload: ModifierGroupUpsertInput): Promise<ManagedModifierGroup> {
  return toManagedModifierGroup(await adminApi.post<ModifierGroupDto>("/catalog/modifier-groups", toRequest(payload)));
}

export async function updateModifierGroup(id: string, payload: ModifierGroupUpsertInput): Promise<ManagedModifierGroup> {
  return toManagedModifierGroup(await adminApi.put<ModifierGroupDto>(`/catalog/modifier-groups/${id}`, toRequest(payload)));
}

export function deleteModifierGroup(id: string): Promise<void> {
  return adminApi.delete<void>(`/catalog/modifier-groups/${id}`);
}
