"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/format-currency";
import type { CartItem } from "../types/cart.types";

type MiniCartItemProps = {
  item: CartItem;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
};

export function MiniCartItem({ item, onIncrease, onDecrease, onRemove }: MiniCartItemProps) {
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

        <p className="mt-0.5 text-xs text-brand-muted">{formatCurrency(item.price)}</p>

        <div className="mt-auto flex items-center justify-between pt-1.5">
          <div className="flex items-center rounded-md border border-brand-line">
            <button
              type="button"
              onClick={() => onDecrease(item.id)}
              aria-label={`Giảm số lượng ${item.name}`}
              className="flex h-6 w-6 items-center justify-center text-brand-ink transition hover:bg-brand-cream"
            >
              <Minus size={12} />
            </button>

            <span className="w-6 text-center text-xs font-bold text-brand-ink">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncrease(item.id)}
              aria-label={`Tăng số lượng ${item.name}`}
              className="flex h-6 w-6 items-center justify-center text-brand-ink transition hover:bg-brand-cream"
            >
              <Plus size={12} />
            </button>
          </div>

          <span className="text-[13px] font-black text-brand-ink">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}
