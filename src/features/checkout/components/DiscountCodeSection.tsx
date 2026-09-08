"use client";

import { useState, type FormEvent } from "react";

import { formatCurrency } from "@/lib/format-currency";
import type { AppliedDiscount } from "../services/discount-code.service";

type DiscountCodeSectionProps = {
  appliedDiscount: AppliedDiscount | null;
  isApplying: boolean;
  error?: string;
  onApply: (code: string) => void;
  onRemove: () => void;
};

/**
 * Checkbox "Tôi có mã giảm giá" ẩn/hiện ô nhập — chỉ là UI toggle cục bộ (mở/
 * đóng ô input), không cần lưu vào Checkout State. Mã ĐÃ ÁP DỤNG THÀNH CÔNG
 * (`appliedDiscount`) mới thuộc Checkout State thật, do `useCheckoutForm` sở
 * hữu và truyền vào qua props — component này chỉ render + gọi callback,
 * không tự validate mã hay tính discountAmount (xem
 * services/discount-code.service.ts).
 */
export function DiscountCodeSection({
  appliedDiscount,
  isApplying,
  error,
  onApply,
  onRemove,
}: DiscountCodeSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply(codeInput);
  }

  function handleRemove() {
    onRemove();
    setCodeInput("");
    setIsOpen(false);
  }

  if (appliedDiscount) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#0f9b55] bg-brand-cream/40 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-brand-greenDark">
            Mã &quot;{appliedDiscount.discountCode}&quot; đã áp dụng
          </p>
          <p className="mt-0.5 text-[12px] text-[#4b4b4b]">
            Giảm {formatCurrency(appliedDiscount.discountAmount)} — {appliedDiscount.description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          className="shrink-0 text-[12px] font-bold text-brand-red hover:underline"
        >
          Hủy áp dụng
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="flex cursor-pointer items-center gap-2 text-[13px] font-bold text-brand-greenDark">
        <input
          type="checkbox"
          checked={isOpen}
          onChange={(event) => setIsOpen(event.target.checked)}
          className="h-4 w-4 accent-[#0f9b55]"
        />
        Tôi có mã giảm giá
      </label>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            placeholder="Nhập mã giảm giá"
            className="h-10 flex-1 rounded-full border border-[#0f9b55] px-4 text-[13px] outline-none transition focus:ring-2 focus:ring-[#0f9b55]/20"
          />

          <button
            type="submit"
            disabled={isApplying || !codeInput.trim()}
            className="h-10 shrink-0 rounded-full bg-brand-green px-5 text-[13px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApplying ? "Đang kiểm tra..." : "Áp dụng"}
          </button>
        </form>
      )}

      {error && <p className="mt-1.5 text-[12px] font-bold text-brand-red">{error}</p>}
    </div>
  );
}
