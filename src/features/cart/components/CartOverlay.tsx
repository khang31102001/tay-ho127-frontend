"use client";

type CartOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Nền mờ phía sau CartDrawer — bấm vào để đóng. Tách riêng khỏi CartDrawer để
 * mỗi component chỉ lo đúng 1 việc. CSS transition thuần — xem giải thích lý
 * do không dùng Motion cho cặp component này trong CartDrawer.tsx.
 */
export function CartOverlay({ isOpen, onClose }: CartOverlayProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClose}
      className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-300 ease-out ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    />
  );
}
