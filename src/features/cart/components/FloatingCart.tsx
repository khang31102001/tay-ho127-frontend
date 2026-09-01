"use client";

import { AnimatePresence, motion } from "motion/react";

import { formatCurrency } from "@/lib/format-currency";

import { useFloatingCart } from "../hooks/useFloatingCart";
import { CartTrigger } from "./CartTrigger";

/**
 * Cart trigger nổi duy nhất của toàn site (gộp từ 2 UI từng tách rời —
 * nút tròn mở Mini Cart khi scroll + thanh "vừa thêm món" chỉ render riêng ở
 * trang thực đơn — xem useFloatingCart). Luôn render trong Header nên chỉ có
 * một cart trigger nổi tại một thời điểm, trên mọi trang:
 *
 * - Vừa thêm sản phẩm: hiện thanh đầy đủ (số lượng, tổng tiền, Đặt ngay),
 *   tự thu gọn sau vài giây.
 * - Đã scroll qua ngưỡng, không phải vừa thêm: thu gọn thành nút tròn, click
 *   để mở Mini Cart (cùng Mini Cart với Header Cart).
 */
export function FloatingCart() {
  const {
    isVisible,
    isExpanded,
    cartCount,
    totalPrice,
    registerCartTarget,
    toggleMiniCart,
    handleCheckout,
    handleCollapse,
  } = useFloatingCart();

  return (
    <AnimatePresence>
      {isVisible &&
        (isExpanded ? (
          <motion.aside
            key="expanded"
            aria-label="Thông tin giỏ hàng"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="
              fixed inset-x-0 bottom-0 z-50
              border-t border-orange-600
              bg-[#ff9818]
              shadow-[0_-4px_16px_rgba(0,0,0,0.15)]
            "
          >
            <div
              className="
                relative mx-auto flex min-h-[78px]
                max-w-[790px] items-center
                justify-between gap-3
                px-5
                pb-[calc(12px+env(safe-area-inset-bottom))]
                pt-3
              "
            >
              {/* Thông tin số lượng */}
              <div className="min-w-0 font-bold text-white">
                <span className="block text-[16px] sm:text-[17px]">
                  Giỏ hàng ({cartCount})
                </span>

                <span className="mt-0.5 block text-xs font-medium text-white/80 sm:hidden">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {/* Tổng tiền */}
              <div className="ml-auto hidden text-right sm:block">
                <strong className="whitespace-nowrap text-[28px] font-black text-white">
                  {formatCurrency(totalPrice)}
                </strong>
              </div>

              {/* Nút checkout */}
              <button
                type="button"
                onClick={handleCheckout}
                className="
                  whitespace-nowrap rounded-md
                  bg-[#f5222d] px-5 py-3
                  text-[15px] font-black text-white
                  transition
                  hover:bg-[#d91823]
                  active:scale-[0.97]
                "
              >
                Đặt ngay
              </button>

              {/* Nút thu gọn */}
              <button
                type="button"
                onClick={handleCollapse}
                aria-label="Thu gọn giỏ hàng"
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full text-[24px]
                  font-medium text-white/90
                  transition
                  hover:bg-white/15
                  hover:text-white
                "
              >
                ×
              </button>
            </div>
          </motion.aside>
        ) : (
          <motion.div
            key="collapsed"
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
              onClick={toggleMiniCart}
            />
          </motion.div>
        ))}
    </AnimatePresence>
  );
}
