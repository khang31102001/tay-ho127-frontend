import type { ManagedModifierGroup } from "@/features/modifier-groups/types/modifier-group.types";
import type { CartItemModifierSelection } from "../types/cart.types";

/**
 * Bộ hàm thuần xử lý "chọn option trong 1 nhóm modifier" — tách riêng khỏi
 * React state vì General Order Options (useOrderOptions) không tự giữ state
 * cục bộ: state DUY NHẤT nằm ở CartContext.orderOptionSelections để Mini Cart
 * và Cart Page luôn đọc/ghi cùng 1 nguồn, đảm bảo đồng bộ 2 chiều ngay lập
 * tức (không qua bước "reset lại state cục bộ" nên không có nguy cơ lệch
 * nhau giữa 2 nơi cùng hiển thị cùng lúc).
 */

/** groupId -> optionId[] mặc định (option isDefault của từng nhóm) — dùng để khởi tạo General Order Options lần đầu (chưa từng chọn gì) từ useOrderOptions. */
export function buildDefaultSelectionMap(groups: ManagedModifierGroup[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  groups.forEach((group) => {
    const defaultOptionIds = group.options.filter((option) => option.isDefault).map((option) => option.id);
    map[group.id] = group.selectionType === "single" ? defaultOptionIds.slice(0, 1) : defaultOptionIds;
  });

  return map;
}

/** groupId -> optionId[] từ danh sách modifier đã lưu (CartItem.modifiers hoặc CartContext.orderOptionSelections). */
export function buildSelectionMapFromModifiers(modifiers: CartItemModifierSelection[] = []): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  modifiers.forEach((modifier) => {
    map[modifier.groupId] = [...(map[modifier.groupId] ?? []), modifier.optionId];
  });

  return map;
}

/** Bật/tắt 1 option trong `current` — "single" luôn thay thế (radio), "multiple" thêm/bớt (checkbox). */
export function toggleModifierOption(
  current: Record<string, string[]>,
  group: ManagedModifierGroup,
  optionId: string,
): Record<string, string[]> {
  const currentIds = current[group.id] ?? [];

  if (group.selectionType === "single") {
    return { ...current, [group.id]: [optionId] };
  }

  const next = currentIds.includes(optionId)
    ? currentIds.filter((id) => id !== optionId)
    : [...currentIds, optionId];

  return { ...current, [group.id]: next };
}

/** groupId -> optionId[] → danh sách modifier đầy đủ (kèm label/giá) theo đúng `groups` — dùng để lưu vào CartItem/CartContext. */
export function resolveSelectedModifiers(
  groups: ManagedModifierGroup[],
  selectedOptionIdsByGroup: Record<string, string[]>,
): CartItemModifierSelection[] {
  const selections: CartItemModifierSelection[] = [];

  groups.forEach((group) => {
    const optionIds = selectedOptionIdsByGroup[group.id] ?? [];

    group.options.forEach((option) => {
      if (optionIds.includes(option.id)) {
        selections.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionLabel: option.label,
          priceAdjustment: option.priceAdjustment,
        });
      }
    });
  });

  return selections;
}

/** Có nhóm bắt buộc (isRequired) nào chưa chọn option nào không — dùng để cảnh báo/chặn xác nhận. */
export function hasMissingRequiredSelection(
  groups: ManagedModifierGroup[],
  selectedOptionIdsByGroup: Record<string, string[]>,
): boolean {
  return groups.some((group) => group.isRequired && (selectedOptionIdsByGroup[group.id] ?? []).length === 0);
}
