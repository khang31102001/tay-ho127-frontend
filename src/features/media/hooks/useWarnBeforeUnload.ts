"use client";

import { useEffect } from "react";

/** Hỏi lại trước khi đóng/tải lại tab trong lúc còn request đang chạy (tránh mất file đang upload dở). */
export function useWarnBeforeUnload(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive]);
}
