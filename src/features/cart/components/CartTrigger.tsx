"use client";

import { forwardRef, useEffect, useRef } from "react";
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

const BADGE_PULSE_DURATION_MS = 400;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Phát hiện `cartCount` đổi (tăng hoặc giảm) để chạy 1 lần pulse ngắn
 * (300–500ms) trên badge số lượng bằng Web Animations API — cùng kỹ thuật
 * với `pulseCartTarget` trong fly-to-cart-context.tsx. Không dùng class
 * `animate-pulse` của Tailwind vì nó lặp vô hạn, gây rung mắt liên tục.
 */
function useBadgePulseRef(cartCount: number) {
  const badgeRef = useRef<HTMLSpanElement>(null);
  const previousCountRef = useRef(cartCount);

  useEffect(() => {
    const hasChanged = previousCountRef.current !== cartCount;
    previousCountRef.current = cartCount;

    if (!hasChanged || !badgeRef.current || prefersReducedMotion()) {
      return;
    }

    badgeRef.current.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.35)" },
        { transform: "scale(1)" },
      ],
      { duration: BADGE_PULSE_DURATION_MS, easing: "ease-out" },
    );
  }, [cartCount]);

  return badgeRef;
}

/**
 * Nút mở Mini Cart, dùng lại cho cả 2 trạng thái Header Cart (variant="header",
 * nằm trong khu vực action của Header) và Floating Cart (variant="floating",
 * thanh ngang compact "[🛒 Giỏ hàng] [SL: XX]" nổi cố định cạnh dưới màn
 * hình). Cả 2 đều đọc `cartCount` từ cùng một nguồn `useCart()` — component
 * này chỉ nhận số lượng qua props, không tự fetch cart.
 */
export const CartTrigger = forwardRef<HTMLButtonElement, CartTriggerProps>(
  function CartTrigger(
    { variant, cartCount, showLabel = false, onClick, className },
    ref,
  ) {
    const badgeLabel = cartCount > 99 ? "99+" : cartCount;
    const badgeRef = useBadgePulseRef(cartCount);

    if (variant === "floating") {
      return (
        <button
          ref={ref}
          data-cart-target
          type="button"
          onClick={onClick}
          aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
          className={cn(
            "group flex items-center gap-2 rounded-full bg-brand-red py-2 pl-4 pr-2.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(0,0,0,0.3)] active:scale-95 md:gap-2.5 md:py-2.5 md:pl-5 md:pr-3",
            className,
          )}
        >
          <ShoppingCart className="size-5 md:size-6" />

          <span className="text-[13px] font-black leading-none md:text-[14px]">
            Giỏ hàng
          </span>

          {cartCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 py-1 pl-2 pr-1.5 text-[11px] font-black leading-none">
              <span className="text-white/80">SL:</span>
              <span ref={badgeRef}>{badgeLabel}</span>
            </span>
          )}
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
            <span
              ref={badgeRef}
              className="absolute -right-2.5 -top-2.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white"
            >
              {badgeLabel}
            </span>
          )}
        </span>

        {showLabel && <span>Giỏ hàng</span>}
      </button>
    );
  },
);
