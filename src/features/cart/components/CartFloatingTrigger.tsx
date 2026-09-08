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
 * Tái sử dụng nguyên `CartTrigger variant="floating"` (thanh ngang compact
 * "Giỏ hàng" + badge số lượng) — component này chỉ lo vị trí + cách hiện/ẩn.
 * Bấm vào mở CÙNG MỘT CartDrawer với Header Cart (cùng `useMiniCart().toggle()`)
 * — không có 2 luồng Cart riêng biệt.
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

  /*
   * `right` từ `md` trở lên bám theo mép phải của Product Grid (trong
   * `.container-page`, xem src/styles/components.css) thay vì bám mép phải
   * viewport — tránh nằm trơ trên nền trống ở màn hình rộng. `.container-page`
   * dùng Tailwind `max-w-7xl` = 1280px, nên khoảng trống 2 bên container ở
   * viewport rộng hơn 1280px là `(100vw - 1280px) / 2`; sửa hằng số 1280px
   * này nếu sau này đổi `max-w-7xl` ở `.container-page`.
   * - Dưới 1280px (container chưa chạm max-width, "Desktop nhỏ"/tablet):
   *   công thức ra số âm/rất nhỏ → clamp về sàn 32px (giữ đúng khoảng cách
   *   `md:right-8` cũ, không đè lên Product Grid).
   * - Từ 1280px trở lên: tăng dần theo khoảng trống thật, chặn trần 320px
   *   để không trôi quá xa khỏi Product Grid ở màn hình siêu rộng.
   * - Dưới `md` (mobile): vẫn dùng `right-4` (16px) như cũ, không đổi.
   */
  return (
    <div
      className={`fixed bottom-5 right-4 z-[1000] transition-[opacity,transform] duration-200 ease-out md:bottom-8 md:right-[clamp(32px,calc((100vw_-_1280px)/2),320px)] ${
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
