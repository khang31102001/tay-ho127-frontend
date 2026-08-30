"use client";

import { forwardRef } from "react";
import { ShoppingCart } from "lucide-react";

import { cn } from "@/lib/cn";

type CartTriggerVariant = "header" | "floating";

type CartTriggerProps = {
  variant: CartTriggerVariant;
  cartCount: number;
  /** Hiện text "Giỏ hàng" cạnh icon — dùng cho Header desktop. */
  showLabel?: boolean;
  onClick: () => void;
  className?: string;
};

/**
 * Nút mở Mini Cart, dùng lại cho cả 2 trạng thái Header Cart (variant="header",
 * nằm trong khu vực action của Header) và Floating Cart (variant="floating",
 * bong bóng tròn nổi cố định). Cả 2 đều đọc `cartCount` từ cùng một nguồn
 * `useCart()` — component này chỉ nhận số lượng qua props, không tự fetch cart.
 */
export const CartTrigger = forwardRef<HTMLButtonElement, CartTriggerProps>(
  function CartTrigger(
    { variant, cartCount, showLabel = false, onClick, className },
    ref,
  ) {
    const badgeLabel = cartCount > 99 ? "99+" : cartCount;

    if (variant === "floating") {
      return (
        <button
          ref={ref}
          data-cart-target
          type="button"
          onClick={onClick}
          aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-brand-red text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition hover:opacity-90 active:scale-95 md:h-14 md:w-14",
            className,
          )}
        >
          <span className="relative">
            <ShoppingCart className="size-5 md:size-6" />

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
                {badgeLabel}
              </span>
            )}
          </span>
        </button>
      );
    }

    return (
      <button
        ref={ref}
        data-cart-target
        type="button"
        onClick={onClick}
        aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
        className={cn(
          "group inline-flex items-center gap-1.5 whitespace-nowrap transition-opacity duration-200 hover:opacity-70",
          className,
        )}
      >
        <span className="relative">
          <ShoppingCart className="size-[18px]" />

          {cartCount > 0 && (
            <span className="absolute -right-2.5 -top-2.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
              {badgeLabel}
            </span>
          )}
        </span>

        {showLabel && <span>Giỏ hàng</span>}
      </button>
    );
  },
);
