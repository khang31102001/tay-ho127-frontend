"use client";

import { useCart } from "../context/cart-context";
import { useFlyToCart } from "../context/fly-to-cart-context";
import { useMiniCart } from "../context/mini-cart-context";
import { useScrollThreshold } from "@/hooks/useScrollThreshold";
import { CartTrigger } from "./CartTrigger";

/**
 * Trạng thái 2 (đã scroll qua threshold) của Mini Cart — nút nổi cố định góc
 * phải dưới màn hình, thay thế Header Cart inline (trạng thái 1, xem
 * Header.tsx) khi khách đã cuộn trang. Dùng chung `useScrollThreshold()` —
 * đúng hook Header cũng dùng để đổi màu nền — không tự viết logic scroll
 * riêng ở đây.
 *
 * Tái sử dụng nguyên `CartTrigger variant="floating"` — giữ đúng màu/style cũ,
 * chỉ đổi vị trí + cách hiện/ẩn. Bấm vào mở CÙNG MỘT CartDrawer với Header
 * Cart (cùng `useMiniCart().toggle()`) — không có 2 luồng Cart riêng biệt.
 *
 * Ẩn khi giỏ trống (không hiện nút hành động rỗng) và ẩn khi CartDrawer đang
 * mở — về mặt hình ảnh, nút này chính là thứ "bung ra" thành CartDrawer (xem
 * MiniCart.tsx/CartDrawer.tsx).
 *
 * CSS transition thuần (không dùng Motion `animate` prop) — cùng lý do với
 * CartDrawer/CartOverlay, xem giải thích trong CartDrawer.tsx.
 */
export function CartFloatingTrigger() {
  const { cartCount } = useCart();
  const { registerCartTarget } = useFlyToCart();
  const { isOpen, toggle } = useMiniCart();
  const isScrolled = useScrollThreshold();

  const isVisible = isScrolled && cartCount > 0 && !isOpen;

  return (
    <div
      className={`fixed bottom-5 right-4 z-[1000] transition-[opacity,transform] duration-200 ease-out md:bottom-8 md:right-8 ${
        isVisible ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0"
      }`}
    >
      <CartTrigger
        ref={(element) => registerCartTarget("floating-bottom", element)}
        variant="floating"
        cartCount={cartCount}
        onClick={toggle}
      />
    </div>
  );
}
