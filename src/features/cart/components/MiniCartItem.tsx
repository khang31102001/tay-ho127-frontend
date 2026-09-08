"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/format-currency";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { calculateCartItemTotal, calculateCartItemUnitPrice } from "../services/cart.service";
import type { CartItem } from "../types/cart.types";
import { CartItemNoteButton } from "./CartItemNoteButton";

type MiniCartItemProps = {
  item: CartItem;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  onSaveNote: (cartItemId: string, note: string) => void;
};

/**
 * Mini Cart cố tình KHÔNG hiện lại toàn bộ checkbox modifier trực tiếp (sẽ
 * làm UI quá dài) — chỉ tóm tắt modifier đã chọn (nếu có). Nước mắm/Rau đã là
 * General Order Options (xem GeneralOrderOptions), quantity sửa trực tiếp
 * ngay tại đây. Ghi chú RIÊNG cho món (`specialInstructions`) sửa được tại
 * chỗ qua `CartItemNoteButton` (mở popup, xem CartItemNoteDialog).
 */
export function MiniCartItem({ item, onIncrease, onDecrease, onRemove, onSaveNote }: MiniCartItemProps) {
  return (
    <li className="flex gap-3 py-3">
      <Image
        src={item.image}
        alt={item.name}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-md object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-[13px] font-bold leading-tight text-brand-ink">
            {item.name}
          </p>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
            className="shrink-0 text-brand-muted transition hover:text-brand-red"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <p className="mt-0.5 text-xs text-brand-muted">{formatCurrency(calculateCartItemUnitPrice(item))}</p>

        {item.modifiers && item.modifiers.length > 0 && (
          <p className="mt-0.5 line-clamp-2 text-[11px] text-brand-muted">
            {item.modifiers.map((modifier) => modifier.optionLabel).join(", ")}
          </p>
        )}

        <CartItemNoteButton item={item} onSave={onSaveNote} />

        <div className="mt-auto flex items-center justify-between pt-1.5">
          <QuantityStepper
            quantity={item.quantity}
            onIncrement={() => onIncrease(item.id)}
            onDecrement={() => onDecrease(item.id)}
            size="sm"
          />

          <span className="text-[13px] font-black text-brand-ink">{formatCurrency(calculateCartItemTotal(item))}</span>
        </div>
      </div>
    </li>
  );
}
