"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ShoppingBag, X } from "lucide-react";

import { formatCurrency } from "@/lib/format-currency";
import { useCart } from "../context/cart-context";
import { useMiniCart } from "../context/mini-cart-context";
import { MiniCartItem } from "./MiniCartItem";

/**
 * Mini Cart dùng chung cho mọi trigger (Header Cart, Floating Cart, Cart
 * trong menu mobile) — chỉ 1 instance, điều khiển bởi `useMiniCart()`, đọc
 * dữ liệu trực tiếp từ `useCart()` nên luôn khớp với badge số lượng.
 * Desktop: dropdown neo góc phải, gần khu vực Cart. Mobile: bottom sheet.
 *
 * Ẩn/hiện bằng CSS transition (opacity/translate + pointer-events), giống
 * đúng pattern dropdown mobile nav trong MobileHeaderMenu.tsx — không dùng
 * AnimatePresence: mount/unmount qua AnimatePresence với nhiều motion node
 * lồng nhau không nhả DOM sau khi exit xong trong môi trường này.
 */
export function MiniCart() {
  const { isOpen, close } = useMiniCart();
  const { cartItems, cartCount, totalPrice, updateQuantity, removeFromCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function handleIncrease(productId: string) {
    const item = cartItems.find((cartItem) => cartItem.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  }

  function handleDecrease(productId: string) {
    const item = cartItems.find((cartItem) => cartItem.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  }

  const isEmpty = cartItems.length === 0;

  function renderHeader() {
    return (
      <div className="flex shrink-0 items-center justify-between border-b border-brand-line px-4 py-3">
        <h2 className="text-[15px] font-black text-brand-ink">Giỏ hàng</h2>
        <button
          type="button"
          onClick={close}
          aria-label="Đóng giỏ hàng"
          className="flex h-8 w-8 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream hover:text-brand-ink"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  function renderBody() {
    if (isEmpty) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <ShoppingBag className="text-brand-muted" size={36} strokeWidth={1.5} />
          <p className="text-sm font-bold text-brand-ink">Giỏ hàng của bạn đang trống</p>
          <Link
            href="/thuc-don"
            onClick={close}
            className="mt-1 rounded-md bg-brand-green px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
          >
            Xem Thực đơn
          </Link>
        </div>
      );
    }

    return (
      <ul className="flex-1 divide-y divide-brand-line overflow-y-auto px-4">
        {cartItems.map((item) => (
          <MiniCartItem
            key={item.id}
            item={item}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={removeFromCart}
          />
        ))}
      </ul>
    );
  }

  function renderFooter() {
    if (isEmpty) {
      return null;
    }

    return (
      <div className="shrink-0 border-t border-brand-line px-4 py-3">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-brand-muted">Tổng {cartCount} món</span>
          <span className="text-base font-black text-brand-ink">
            Tổng tiền: {formatCurrency(totalPrice)}
          </span>
        </div>

        {/*
         * Chỉ 1 CTA duy nhất: Checkout bắt buộc phải đi qua Cart Page
         * (/gio-hang) để review trước (xem cart-review.service.ts) — trước
         * đây có thêm nút "Đặt ngay" nhảy thẳng /checkout, bỏ đi để không còn
         * đường tắt bỏ qua bước review.
         */}
        <Link
          href="/gio-hang"
          onClick={close}
          className="flex h-11 w-full items-center justify-center rounded-md bg-brand-red text-sm font-bold text-white transition hover:opacity-90"
        >
          Xem giỏ hàng
        </Link>
      </div>
    );
  }

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      aria-hidden={!isOpen}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      className={`
        fixed inset-x-0 bottom-0 top-16 z-[9999] bg-black/30
        transition-opacity duration-200 ease-out
        md:top-[68px]
        ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}
      `}
    >
      {/* Desktop: dropdown neo góc phải, gần khu vực Cart */}
      <div
        role="dialog"
        aria-label="Giỏ hàng"
        className={`
          fixed right-4 top-[76px] hidden max-h-[70vh] w-[360px] flex-col overflow-hidden
          rounded-2xl border border-brand-line bg-white shadow-soft
          transition-all duration-200 ease-out
          sm:flex md:right-8 md:top-[88px]
          ${isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-3 scale-95 opacity-0"}
        `}
      >
        {renderHeader()}
        {renderBody()}
        {renderFooter()}
      </div>

      {/* Mobile: bottom sheet */}
      <div
        className={`
          fixed inset-x-0 bottom-0
          transition-transform duration-300 ease-out
          sm:hidden
          ${isOpen ? "translate-y-0" : "pointer-events-none translate-y-full"}
        `}
      >
        <div
          role="dialog"
          aria-label="Giỏ hàng"
          className="flex max-h-[80vh] flex-col overflow-hidden rounded-t-2xl border-t border-brand-line bg-white shadow-soft"
        >
          {renderHeader()}
          {renderBody()}
          {renderFooter()}
        </div>
      </div>
    </div>,
    document.body,
  );
}
