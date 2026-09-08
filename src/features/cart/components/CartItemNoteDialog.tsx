"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { BottomSheetDialog } from "@/components/ui/BottomSheetDialog";

const NOTE_MAX_LENGTH = 250;

type CartItemNoteDialogProps = {
  itemName: string;
  initialNote: string;
  onClose: () => void;
  onSave: (note: string) => void;
};

/**
 * Popup sửa ghi chú riêng cho 1 Cart Item — dùng chung `BottomSheetDialog`
 * (UI Primitive có sẵn, trước đây tách ra từ QuickAddModal nhưng chưa có
 * consumer nào) làm shell portal/overlay/escape-to-close/khóa scroll, ở đây
 * chỉ lo phần nội dung (tên món/textarea/character counter/Hủy/Lưu).
 *
 * Xóa ghi chú = xóa hết text rồi bấm "Lưu ghi chú" (submit chuỗi rỗng) —
 * không cần thêm nút "Xóa" riêng, `updateCartItemSpecialInstructions` đã tự
 * coi chuỗi rỗng là xóa (xem cart.service.ts).
 */
export function CartItemNoteDialog({ itemName, initialNote, onClose, onSave }: CartItemNoteDialogProps) {
  const [draft, setDraft] = useState(initialNote);

  function handleSave() {
    onSave(draft);
    onClose();
  }

  return (
    <BottomSheetDialog ariaLabel={`Ghi chú cho ${itemName}`} onClose={onClose}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-brand-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-[11px] font-black uppercase tracking-wide text-brand-muted">Ghi chú cho món</h2>
          <p className="truncate text-[15px] font-black text-brand-ink">{itemName}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream hover:text-brand-ink"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <textarea
          autoFocus
          value={draft}
          maxLength={NOTE_MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ví dụ: Không hành, ít tiêu, nước mắm để riêng"
          className="h-[110px] w-full resize-none rounded-xl border border-[#0f9b55] px-4 py-3 text-[13px] outline-none transition focus:ring-2 focus:ring-[#0f9b55]/20"
        />

        <p className="mt-1.5 text-right text-[11px] text-brand-muted">
          {draft.length}/{NOTE_MAX_LENGTH}
        </p>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-brand-line px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="h-10 flex-1 rounded-md border border-brand-line text-[13px] font-bold text-brand-ink transition hover:bg-brand-cream"
        >
          Hủy
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="h-10 flex-1 rounded-md bg-brand-red text-[13px] font-bold text-white transition hover:opacity-90"
        >
          Lưu ghi chú
        </button>
      </div>
    </BottomSheetDialog>
  );
}
