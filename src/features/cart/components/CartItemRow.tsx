"use client";

import Image from "next/image";

import { formatCurrency } from "@/lib/format-currency";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { calculateCartItemTotal, calculateCartItemUnitPrice } from "../services/cart.service";
import type { CartItem } from "../types/cart.types";

type CartItemRowProps = {
  item: CartItem;
  onIncrease: (cartItemId: string) => void;
  onDecrease: (cartItemId: string) => void;
  onRemove: (cartItemId: string) => void;
};

/** 1 dòng món trong Cart Page (/gio-hang) — tách từ CartPageSection để dùng chung markup hiển thị modifier/ghi chú với logic đã có ở đó. */
export function CartItemRow({ item, onIncrease, onDecrease, onRemove }: CartItemRowProps) {
  return (
    <article className="grid grid-cols-1 gap-4 border-b border-black py-3 last:border-b-0 sm:grid-cols-[115px_1fr_120px]">
      <Image
        src={item.image}
        alt={item.name}
        width={105}
        height={88}
        className="h-[88px] w-[105px] rounded object-cover"
      />

      <div>
        <h2 className="text-[16px] font-black text-brand-greenDark">{item.name}</h2>
        <p className="mt-1 text-[13px] text-[#4b4b4b]">{formatCurrency(calculateCartItemUnitPrice(item))} / phần</p>

        {item.modifiers && item.modifiers.length > 0 && (
          <ul className="mt-1 text-[12px] text-[#7a7a7a]">
            {item.modifiers.map((modifier) => (
              <li key={modifier.optionId}>
                {modifier.groupName}: {modifier.optionLabel}
              </li>
            ))}
          </ul>
        )}

        {item.specialInstructions && (
          <p className="mt-1 text-[12px] italic text-[#7a7a7a]">Ghi chú: {item.specialInstructions}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] font-bold text-black">
          <QuantityStepper
            quantity={item.quantity}
            onIncrement={() => onIncrease(item.id)}
            onDecrement={() => onDecrease(item.id)}
            size="sm"
          />

          <button type="button" onClick={() => onRemove(item.id)} className="text-sm font-bold text-brand-red">
            Xóa
          </button>
        </div>
      </div>

      <div className="self-center text-left text-[16px] font-black text-black sm:text-right">
        {formatCurrency(calculateCartItemTotal(item))}
      </div>
    </article>
  );
}
