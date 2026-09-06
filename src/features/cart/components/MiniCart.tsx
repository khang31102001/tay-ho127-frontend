"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useMiniCart } from "../context/mini-cart-context";
import { CartDrawer } from "./CartDrawer";
import { CartFloatingTrigger } from "./CartFloatingTrigger";
import { CartOverlay } from "./CartOverlay";

/**
 * Ghép 3 mảnh trình bày Cart lại thành 1 điểm mount duy nhất cho Header:
 * CartFloatingTrigger (nút nổi góc phải dưới) + CartOverlay + CartDrawer
 * (right-side drawer). Business state vẫn 100% ở `useMiniCart()`/`useCart()`
 * — component này không giữ logic gì khác ngoài mount/escape-to-close/khóa
 * scroll body, y hệt hành vi MiniCart cũ trước khi tách presentation.
 *
 * Overlay/Drawer luôn mount sẵn, chỉ đổi CSS transition theo `isOpen` (không
 * unmount qua AnimatePresence) — xem lý do đầy đủ trong CartDrawer.tsx.
 */
export function MiniCart() {
  const { isOpen, close } = useMiniCart();
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

  return (
    <>
      <CartFloatingTrigger />

      {isMounted &&
        createPortal(
          <>
            <CartOverlay isOpen={isOpen} onClose={close} />
            <CartDrawer isOpen={isOpen} onClose={close} />
          </>,
          document.body,
        )}
    </>
  );
}
