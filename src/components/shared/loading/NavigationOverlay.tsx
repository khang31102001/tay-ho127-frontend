"use client";

import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";

import { useNavigationLoading } from "@/provider/navigation-loading-provider";

type NavigationOverlayProps = {
  text?: string;
};

/**
 * Overlay full-screen khi đang chuyển route: `fixed` + z-index dưới thanh
 * NavigationProgress (10060) nhưng trên header/sidebar/nút nổi/modal, nên chặn
 * mọi click. Khóa thêm scroll của trang trong lúc loading; click vào link/
 * router.push thứ hai bị provider bỏ qua. Hiện trễ ~120ms qua animation-delay
 * (route nhanh thì không chớp) — trong 120ms đó overlay vẫn nhận pointer event.
 */
export function NavigationOverlay({ text = "Đang chuyển trang..." }: NavigationOverlayProps) {
  const { phase } = useNavigationLoading();
  const isLoading = phase === "loading";

  useEffect(() => {
    if (!isLoading) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPaddingRight = root.style.paddingRight;
    // Bù độ rộng scrollbar để layout không giật khi ẩn thanh cuộn.
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPaddingRight;
    };
  }, [isLoading]);

  if (phase === "idle") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      className={`fixed inset-0 z-[10050] flex flex-col items-center justify-center gap-2 bg-white/60 ${
        isLoading ? "nav-overlay-in cursor-progress" : "nav-overlay-out pointer-events-none"
      }`}
    >
      <LoaderCircle className="size-8 animate-spin text-brand-green" aria-hidden="true" />
      <p className="text-[13px] font-bold text-brand-ink">{text}</p>
    </div>
  );
}
