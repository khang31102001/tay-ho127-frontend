"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";

import { cn } from "@/lib/cn";
import type { CartItem } from "../types/cart.types";
import { CartItemNoteDialog } from "./CartItemNoteDialog";

type CartItemNoteButtonProps = {
  item: CartItem;
  onSave: (cartItemId: string, note: string) => void;
  className?: string;
};

/**
 * Dòng "Ghi chú cho món" bên dưới mỗi Cart Item — dùng chung cho Mini Cart
 * (MiniCartItem) và Cart Page (CartItemRow), cả 2 đọc/ghi thẳng
 * `CartItem.specialInstructions` qua CÙNG `useCart().updateCartItemNote()`
 * (truyền vào qua prop `onSave`) — không có state note riêng ở từng nơi
 * hiển thị. Toàn bộ vùng có thể click để mở popup sửa/xóa (CartItemNoteDialog).
 *
 * Preview luôn rút gọn 1 dòng (`truncate`) để không đẩy layout Price/Quantity
 * bên dưới — xem chi tiết đầy đủ/sửa trong popup.
 */
export function CartItemNoteButton({ item, onSave, className }: CartItemNoteButtonProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const hasNote = Boolean(item.specialInstructions);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsEditorOpen(true)}
        aria-label={hasNote ? `Sửa ghi chú cho ${item.name}` : `Thêm ghi chú cho ${item.name}`}
        className={cn(
          "mt-1.5 flex w-full min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] font-semibold transition",
          hasNote
            ? "bg-brand-cream/70 text-brand-ink hover:bg-brand-cream"
            : "border border-dashed border-brand-line text-brand-muted hover:border-brand-green hover:text-brand-green",
          className,
        )}
      >
        <NotebookPen size={12} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">
          {hasNote ? item.specialInstructions : "+ Thêm ghi chú"}
        </span>
      </button>

      {isEditorOpen && (
        <CartItemNoteDialog
          itemName={item.name}
          initialNote={item.specialInstructions ?? ""}
          onClose={() => setIsEditorOpen(false)}
          onSave={(note) => onSave(item.id, note)}
        />
      )}
    </>
  );
}
