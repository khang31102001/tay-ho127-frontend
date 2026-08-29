"use client";

import { AnimatePresence, motion } from "motion/react";

import { useScrollThreshold } from "@/hooks/useScrollThreshold";
import { useCart } from "../context/cart-context";
import { useFlyToCart } from "../context/fly-to-cart-context";
import { useMiniCart } from "../context/mini-cart-context";
import { CartTrigger } from "./CartTrigger";

/**
 * State 2 của Cart: khi trang đã scroll qua ngưỡng (cùng ngưỡng Header dùng để
 * đổi màu — `useScrollThreshold()` mặc định 50px), Header Cart ẩn đi và
 * Floating Cart này nổi lên ở góc phải màn hình, luôn hiển thị khi tiếp tục
 * scroll. Click vào đây mở cùng một Mini Cart với Header Cart.
 */
export function FloatingCart() {
  const isScrolled = useScrollThreshold();
  const { cartCount } = useCart();
  const { registerCartTarget } = useFlyToCart();
  const { toggle } = useMiniCart();

  const isVisible = isScrolled && cartCount > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed right-4 top-[76px] z-40 md:right-8 md:top-[88px]"
        >
          <CartTrigger
            ref={(element) => registerCartTarget("floating", element)}
            variant="floating"
            cartCount={cartCount}
            onClick={toggle}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
