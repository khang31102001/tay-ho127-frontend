"use client";

import { formatCurrency } from "@/lib/format-currency";
import type { ManagedModifierGroup } from "@/features/modifier-groups/types/modifier-group.types";

type ModifierSelectorProps = {
  groups: ManagedModifierGroup[];
  /** groupId -> danh sách optionId đang được chọn (selectionType "single" luôn tối đa 1 phần tử). */
  selectedOptionIdsByGroup: Record<string, string[]>;
  onToggleOption: (group: ManagedModifierGroup, optionId: string) => void;
};

/**
 * Render các nhóm Modifier (Nước mắm/Rau...) của 1 Product — dữ liệu 100% lấy
 * từ Admin (features/modifier-groups) qua props, không hard-code tên nhóm/lựa
 * chọn nào ở đây. `selectionType` quyết định radio (single) hay checkbox
 * (multiple), hoàn toàn không cần biết ý nghĩa nghiệp vụ cụ thể của từng nhóm.
 */
export function ModifierSelector({ groups, selectedOptionIdsByGroup, onToggleOption }: ModifierSelectorProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => {
        const selectedOptionIds = selectedOptionIdsByGroup[group.id] ?? [];

        return (
          <fieldset key={group.id}>
            <legend className="text-sm font-bold text-brand-ink">
              {group.name}
              {group.isRequired && <span className="ml-1 text-brand-red">*</span>}
            </legend>

            <div className="mt-2 flex flex-col gap-1.5">
              {group.options.map((option) => {
                const isChecked = selectedOptionIds.includes(option.id);

                return (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-[14px] text-brand-ink transition hover:bg-brand-cream"
                  >
                    <input
                      type={group.selectionType === "single" ? "radio" : "checkbox"}
                      name={`modifier-group-${group.id}`}
                      checked={isChecked}
                      onChange={() => onToggleOption(group, option.id)}
                      className="size-4 shrink-0 accent-brand-red"
                    />
                    <span className="flex-1">{option.label}</span>
                    {option.priceAdjustment !== 0 && (
                      <span className="text-[13px] font-bold text-brand-muted">
                        {option.priceAdjustment > 0 ? "+" : ""}
                        {formatCurrency(option.priceAdjustment)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
