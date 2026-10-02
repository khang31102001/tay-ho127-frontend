"use client";

import { useEffect, useState } from "react";

import type { NavigationPhase } from "@/provider/navigation-loading-provider";

type NavigationProgressProps = {
  phase: NavigationPhase;
};

/**
 * Thanh tiến trình mỏng ở đỉnh màn hình. Không biết % thật của route nên chạy
 * "trickle" tới ~85% (chậm dần) rồi nhảy 100% khi route sẵn sàng.
 */
export function NavigationProgress({ phase }: NavigationProgressProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (phase === "loading") {
      setWidth(0);
      // 2 frame: để trình duyệt vẽ width 0 trước, transition mới chạy được.
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setWidth(85)));
      return () => cancelAnimationFrame(frame);
    }

    if (phase === "done") setWidth(100);
  }, [phase]);

  if (phase === "idle") return null;

  const isLoading = phase === "loading";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[10060] h-[3px] transition-opacity duration-300 ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-brand-green"
        style={{
          width: `${width}%`,
          transition: isLoading
            ? "width 8s cubic-bezier(0.1, 0.6, 0.2, 1)"
            : "width 200ms ease-out",
        }}
      />
    </div>
  );
}
