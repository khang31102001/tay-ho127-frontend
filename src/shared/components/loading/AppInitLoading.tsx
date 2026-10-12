"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type AppInitLoadingProps = {
  /** true khi app đã khởi tạo xong (auth/session/config...). Chỉ cần bật 1 lần. */
  isReady: boolean;
  logoSrc: string;
  title: string;
  message?: string;
};

const FADE_OUT_MS = 300;

/**
 * Màn hình loading toàn trang cho lần khởi tạo app (mở web / reload), dùng chung
 * User Site và Admin Site — chỉ khác logo/title qua props.
 *
 * Chỉ hiện đúng 1 lần cho mỗi lần mount: nếu mount khi đã ready (vd. điều hướng
 * client-side vào) thì không hiện gì; đã fade-out xong thì không quay lại dù
 * isReady đổi lại. Vì vậy đổi route không bao giờ gọi lại màn hình này.
 */
export function AppInitLoading({
  isReady,
  logoSrc,
  title,
  message = "Đang khởi tạo hệ thống...",
}: AppInitLoadingProps) {
  const [isMounted, setIsMounted] = useState(!isReady);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isReady || !isMounted) return;

    setIsFading(true);
    const timer = window.setTimeout(() => setIsMounted(false), FADE_OUT_MS);
    return () => window.clearTimeout(timer);
  }, [isReady, isMounted]);

  if (!isMounted) return null;

  return (
    <div
      role="status"
      aria-busy={!isFading}
      aria-live="polite"
      className={`fixed inset-0 z-[10100] flex flex-col items-center justify-center gap-6 bg-white px-6 transition-opacity ease-out ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
    >
      <Image
        src={logoSrc}
        alt={title}
        width={260}
        height={116}
        priority
        className="h-auto w-44 animate-pulse"
      />

      <p className="text-center text-[16px] font-black text-brand-greenDark">{title}</p>

      <div className="h-1 w-56 overflow-hidden rounded-full bg-brand-green/15">
        <div className="app-init-bar h-full w-1/3 rounded-full bg-brand-green" />
      </div>

      <p className="text-[13px] text-brand-muted">{message}</p>
    </div>
  );
}
