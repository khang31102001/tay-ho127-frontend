"use client";

import { LoaderCircle } from "lucide-react";

import { useNavigationLoading } from "@/provider/navigation-loading-provider";

type NavigationOverlayProps = {
  text?: string;
};

/**
 * Overlay nhẹ phủ vùng nội dung khi đang chuyển route. Đặt bên trong một
 * container `relative` (thường là <main>) — không phủ sidebar/header, giữ UI cũ
 * phía dưới. Hiện trễ ~120ms qua animation-delay (route nhanh thì không chớp).
 */
export function NavigationOverlay({ text = "Đang chuyển trang..." }: NavigationOverlayProps) {
  const { phase } = useNavigationLoading();

  if (phase === "idle") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute inset-0 z-20 bg-white/60 ${
        phase === "loading" ? "nav-overlay-in" : "nav-overlay-out pointer-events-none"
      }`}
    >
      {/* sticky: spinner luôn nằm trong tầm nhìn dù nội dung rất dài. */}
      <div className="sticky top-[38svh] flex flex-col items-center gap-2">
        <LoaderCircle className="size-8 animate-spin text-brand-green" aria-hidden="true" />
        <p className="text-[13px] font-bold text-brand-ink">{text}</p>
      </div>
    </div>
  );
}
