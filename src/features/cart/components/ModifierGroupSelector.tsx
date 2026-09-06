"use client";

import { useId } from "react";
import { formatCurrency } from "@/lib/format-currency";
import type { ManagedModifierGroup } from "@/features/modifier-groups/types/modifier-group.types";

type ModifierGroupSelectorProps = {
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
 *
 * Dùng chung bởi cả 2 luồng Add to Cart (features/menu: trang chi tiết sản
 * phẩm + Quick Add Modal ở lưới) và Edit trong giỏ hàng (features/cart
 * CartItemEditor) — đặt tại đây (thay vì features/menu hay features/modifier-groups,
 * vốn là domain Admin CRUD) vì features/menu đã sẵn phụ thuộc vào features/cart
 * (useCart/useFlyToCart), giữ đúng 1 chiều phụ thuộc thay vì tạo domain mới.
 *
 * `useId()` để tạo tiền tố `name` riêng cho MỖI LẦN MOUNT component này —
 * bắt buộc phải có vì General Order Options render CÙNG LÚC ở 2 nơi (Cart
 * Page + Mini Cart Drawer luôn mount ngầm ở Header, kể cả khi đang đóng), cả
 * 2 dùng chung `group.id` (từ cùng 1 nguồn dữ liệu order-options) nên nếu
 * dùng thẳng `group.id` làm `name`, 2 bộ `<input name="...">` ở 2 cây React
 * riêng biệt sẽ trùng tên — trình duyệt coi đó là 1 NHÓM RADIO DUY NHẤT theo
 * chuẩn HTML (name không biết ranh giới component), tự uncheck chéo lẫn nhau
 * ở tầng DOM native mà React không phát hiện lại được (radio nhóm kia không
 * đổi props nên React không re-render lại `checked` cho nó) — chọn 1 nơi thì
 * nơi còn lại hiển thị sai/mất chọn dù state Cart vẫn đúng. Không ảnh hưởng
 * logic app (`group.id` vẫn dùng cho selectedOptionIdsByGroup/callback).
 */
export function ModifierGroupSelector({ groups, selectedOptionIdsByGroup, onToggleOption }: ModifierGroupSelectorProps) {
  const instanceId = useId();

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
                      name={`modifier-group-${group.id}${instanceId}`}
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
