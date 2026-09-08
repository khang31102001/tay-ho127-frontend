"use client";

import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";

import { formatCurrency } from "@/lib/format-currency";
import { useCart } from "../context/cart-context";
import { GeneralOrderOptions } from "./GeneralOrderOptions";
import { MiniCartItem } from "./MiniCartItem";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Right-side Drawer / Off-canvas Cart — thay cho MiniCart dropdown (desktop)
 * + bottom sheet (mobile) riêng biệt trước đây bằng ĐÚNG 1 layout duy nhất,
 * full height bên phải, cho cả 2 kích thước màn hình (chỉ khác width).
 *
 * "Bung ra từ FloatingCartButton": scale đồng thời cả 2 trục từ một hộp nhỏ
 * neo `transformOrigin: bottom right` (đúng góc nút Cart đang đứng) lên kích
 * thước đầy đủ — dùng transform/opacity (không animate width/height) để
 * tránh reflow.
 *
 * Dùng CSS transition thuần (className theo `isOpen`) thay vì Motion
 * `animate` prop: đã thử Motion (inline object, named variants,
 * AnimatePresence) cho đúng component này — style do Motion điều khiển bị
 * "đông cứng" ở giá trị ban đầu và AnimatePresence không nhả DOM sau khi exit
 * xong (đúng bug đã ghi chú lại trong lịch sử MiniCart.tsx cũ), xác nhận
 * trực tiếp trên browser với nhiều lần thử. CSS transition là cách đã chạy
 * đúng trước đây cho chính MiniCart này, không có nguy cơ đó.
 */
export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, cartCount, totalPrice, updateQuantity, removeFromCart, updateCartItemNote } = useCart();

  const isEmpty = cartItems.length === 0;

  function handleIncrease(cartItemId: string) {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (item) updateQuantity(cartItemId, item.quantity + 1);
  }

  function handleDecrease(cartItemId: string) {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (item) updateQuantity(cartItemId, item.quantity - 1);
  }

  return (
    <div
      role="dialog"
      aria-label="Giỏ hàng"
      aria-hidden={!isOpen}
      style={{ transformOrigin: "bottom right" }}
      className={`
        fixed right-0 top-0 z-[9999] flex h-[100dvh] w-full flex-col overflow-hidden
        bg-white shadow-soft
        transition-[transform,opacity] duration-300 ease-out
        sm:w-[400px]
        ${
          isOpen
            ? "pointer-events-auto scale-x-100 scale-y-100 opacity-100"
            : "pointer-events-none scale-x-[0.08] scale-y-[0.03] opacity-0"
        }
      `}
    >
      {/* Sticky Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-brand-line px-4 py-3">
        <h2 className="text-[15px] font-black text-brand-ink">Giỏ hàng</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng giỏ hàng"
          className="flex h-8 w-8 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream hover:text-brand-ink"
        >
          <X size={18} />
        </button>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <ShoppingBag className="text-brand-muted" size={36} strokeWidth={1.5} />
          <p className="text-sm font-bold text-brand-ink">Giỏ hàng của bạn đang trống</p>
          <Link
            href="/thuc-don"
            onClick={onClose}
            className="mt-1 rounded-md bg-brand-green px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
          >
            Xem Thực đơn
          </Link>
        </div>
      ) : (
        <>
          {/* Scrollable Cart Items */}
          <ul className="flex-1 divide-y divide-brand-line overflow-y-auto px-4">
            {cartItems.map((item) => (
              <MiniCartItem
                key={item.id}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={removeFromCart}
                onSaveNote={updateCartItemNote}
              />
            ))}
          </ul>

          {/* General Order Options */}
          <div className="shrink-0 border-t border-brand-line px-4 py-3">
            <GeneralOrderOptions compact />
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 border-t border-brand-line px-4 py-3">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-brand-muted">Tổng {cartCount} món</span>
              <span className="text-base font-black text-brand-ink">Tổng tiền: {formatCurrency(totalPrice)}</span>
            </div>

            {/*
             * Chỉ 1 CTA duy nhất: Checkout bắt buộc phải đi qua Cart Page
             * (/gio-hang) để review trước (xem cart-review.service.ts).
             */}
            <Link
              href="/gio-hang"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-md bg-brand-red text-sm font-bold text-white transition hover:opacity-90"
            >
              Xem giỏ hàng
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
