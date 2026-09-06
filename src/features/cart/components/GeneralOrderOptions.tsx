"use client";

import type { ChangeEvent } from "react";
import { RadioOption } from "@/components/ui/RadioOption";
import { useCart } from "../context/cart-context";
import { useOrderOptions } from "../hooks/useOrderOptions";
import type { UtensilsPreference } from "../types/cart.types";
import { ModifierGroupSelector } from "./ModifierGroupSelector";

type GeneralOrderOptionsProps = {
  /** Mini Cart cần tiêu đề gọn hơn Cart Page (heading section riêng của trang) — không tạo 2 component khác nhau chỉ vì khác cỡ chữ. */
  compact?: boolean;
  /**
   * Gộp thêm "Dụng cụ ăn uống" + "Ghi chú đơn hàng" (trước đây là component
   * OrderPreferenceForm riêng, đứng dưới CÁCH NHẬN HÀNG) vào chung section
   * này — chỉ Cart Page (/gio-hang) bật, Mini Cart giữ gọn như cũ vì không có
   * chỗ cho 1 textarea dài trong dropdown.
   */
  showOrderPreferences?: boolean;
};

/**
 * "General Order Options" (Nước mắm/Rau...) — áp dụng cho TOÀN đơn, hiển thị
 * bên dưới danh sách item ở cả Mini Cart và Cart Page (/gio-hang), dùng chung
 * `useOrderOptions` nên 2 nơi luôn đồng bộ. Domain/data đến từ
 * features/order-options — component này chỉ hiển thị + gọi callback chọn,
 * không tự định nghĩa option nào.
 */
export function GeneralOrderOptions({ compact = false, showOrderPreferences = false }: GeneralOrderOptionsProps) {
  const { groups, isLoading, selectedOptionIdsByGroup, handleToggleOption, hasMissingRequiredOption } =
    useOrderOptions();
  const { utensils, setUtensils, note, setNote } = useCart();

  function handleNoteChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setNote(event.target.value);
  }

  if (isLoading) {
    return <p className="text-[13px] text-brand-muted">Đang tải tùy chọn đơn hàng...</p>;
  }

  return (
    <div>
      <h3 className={compact ? "mb-2 text-[13px] font-black text-brand-ink" : "mb-3 text-[15px] font-black text-brand-green"}>
        Tùy chọn chung cho đơn hàng
      </h3>

      {groups.length > 0 && (
        <>
          <ModifierGroupSelector
            groups={groups}
            selectedOptionIdsByGroup={selectedOptionIdsByGroup}
            onToggleOption={handleToggleOption}
          />

          {hasMissingRequiredOption && (
            <p className="mt-2 text-[12px] font-bold text-brand-red">
              Vui lòng chọn đủ các tùy chọn bắt buộc (*) ở trên.
            </p>
          )}
        </>
      )}

      {showOrderPreferences && (
        <div className={`space-y-4 text-[13px] font-medium text-brand-greenDark ${groups.length > 0 ? "mt-5" : ""}`}>
          <div>
            <p className="mb-2 font-bold">Dụng cụ ăn uống</p>
            <div className="flex gap-6">
              <RadioOption<UtensilsPreference>
                name="utensils"
                value="yes"
                checked={utensils === "yes"}
                onChange={setUtensils}
                label="Có"
              />
              <RadioOption<UtensilsPreference>
                name="utensils"
                value="no"
                checked={utensils === "no"}
                onChange={setUtensils}
                label="Không"
              />
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block font-bold">Ghi chú đơn hàng</span>
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Ví dụ: giao trước 11h30, gọi trước khi giao..."
              className="h-[120px] w-full resize-none rounded-xl border border-[#0f9b55] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#0f9b55]/20"
            />
          </label>
        </div>
      )}
    </div>
  );
}
