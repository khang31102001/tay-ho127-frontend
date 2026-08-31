import type { ChangeEvent } from "react";
import { RadioOption } from "@/components/ui/RadioOption";
import type { UtensilsPreference } from "../types/checkout.types";

type OrderPreferenceFormProps = {
  utensils: UtensilsPreference;
  onUtensilsChange: (value: UtensilsPreference) => void;
  note: string;
  onNoteChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

/** #6 ORDER-LEVEL OPTIONS — áp dụng cho toàn đơn, tách khỏi CartItem/Product. */
export function OrderPreferenceForm({ utensils, onUtensilsChange, note, onNoteChange }: OrderPreferenceFormProps) {
  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">TÙY CHỌN ĐƠN HÀNG</h2>

      <div className="space-y-4 text-[13px] font-medium text-brand-greenDark">
        <div>
          <p className="mb-2 font-bold">Dụng cụ ăn uống</p>
          <div className="flex gap-6">
            <RadioOption<UtensilsPreference>
              name="utensils"
              value="yes"
              checked={utensils === "yes"}
              onChange={onUtensilsChange}
              label="Có"
            />
            <RadioOption<UtensilsPreference>
              name="utensils"
              value="no"
              checked={utensils === "no"}
              onChange={onUtensilsChange}
              label="Không"
            />
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block font-bold">Ghi chú đơn hàng</span>

          <textarea
            name="note"
            value={note}
            onChange={onNoteChange}
            placeholder="Ví dụ: giao trước 11h30, gọi trước khi giao..."
            className="h-[120px] w-full resize-none rounded-xl border border-[#0f9b55] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#0f9b55]/20"
          />
        </label>
      </div>
    </section>
  );
}
