"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetDialogProps = {
  ariaLabel: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * UI Primitive: bottom sheet (mobile) / dialog giữa màn hình (desktop) —
 * chỉ lo phần vỏ (portal/overlay/escape-to-close/khóa scroll body/animation
 * vào-ra), không biết nội dung bên trong là gì. Tách ra từ QuickAddModal
 * (features/menu) khi CartItemEditor (features/cart) cần đúng 1 shell y hệt
 * — tránh lặp lại lần thứ 3 cùng một khối portal/overlay.
 *
 * KHÔNG dùng cho MiniCart: MiniCart có layout khác hẳn (dropdown neo góc phải
 * trên desktop + bottom sheet trên mobile cùng lúc trong 1 lần render), ép
 * dùng chung sẽ phải thêm nhiều prop cấu hình chỉ để phục vụ 1 consumer.
 */
export function BottomSheetDialog({ ariaLabel, onClose, children }: BottomSheetDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div
      aria-hidden={!isVisible}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 transition-opacity duration-200 ease-out sm:items-center ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        role="dialog"
        aria-label={ariaLabel}
        className={`flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-soft transition-transform duration-200 ease-out sm:max-w-[420px] sm:rounded-2xl ${
          isVisible ? "translate-y-0" : "translate-y-full sm:translate-y-4"
        }`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
