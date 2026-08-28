"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";

/**
 * Overlay chỉ thực sự hiện sau khoảng trễ này — tránh nhấp nháy khi request
 * quá nhanh (nếu hide() được gọi trước khi hết trễ, overlay sẽ không hiện).
 */
const SHOW_DELAY_MS = 150;

/**
 * Một khi đã hiện, overlay giữ tối thiểu khoảng thời gian này trước khi ẩn —
 * tránh hiện rồi biến mất ngay gây giật hình.
 */
const MIN_VISIBLE_MS = 400;

interface LoadingContextValue {
  isLoading: boolean;
  /** Tăng bộ đếm loading toàn cục và (sau một trễ ngắn) hiện overlay. */
  show: (message?: string) => void;
  /** Giảm bộ đếm; overlay chỉ ẩn khi không còn tác vụ nào đang chờ. */
  hide: () => void;
  /** Bọc một Promise: tự show() trước khi chạy và hide() khi xong (kể cả lỗi). */
  withLoading: <T>(task: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const pendingCountRef = useRef(0);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const shownAtRef = useRef<number | null>(null);

  const show = useCallback((nextMessage?: string) => {
    pendingCountRef.current += 1;

    if (nextMessage) {
      setMessage(nextMessage);
    }

    // Đã có tác vụ khác đang chờ hiển thị/hiện overlay, không cần lên lịch lại.
    if (pendingCountRef.current > 1) {
      return;
    }

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    showTimerRef.current = window.setTimeout(() => {
      showTimerRef.current = null;
      shownAtRef.current = Date.now();
      setIsVisible(true);
    }, SHOW_DELAY_MS);
  }, []);

  const hide = useCallback(() => {
    pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);

    if (pendingCountRef.current > 0) {
      return;
    }

    // Chưa kịp hiện (request quá nhanh) — hủy lịch hiện, không cần ẩn gì cả.
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
      return;
    }

    const shownAt = shownAtRef.current;
    const elapsed = shownAt ? Date.now() - shownAt : MIN_VISIBLE_MS;
    const remaining = MIN_VISIBLE_MS - elapsed;

    if (remaining > 0) {
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = null;
        shownAtRef.current = null;
        setIsVisible(false);
      }, remaining);
      return;
    }

    shownAtRef.current = null;
    setIsVisible(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(task: Promise<T>, taskMessage?: string): Promise<T> => {
      show(taskMessage);

      try {
        return await task;
      } finally {
        hide();
      }
    },
    [show, hide],
  );

  // Dọn timer còn treo khi Provider unmount (chuyển giữa Site/Admin).
  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Khóa scroll nền trong lúc overlay hiển thị.
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  const value = useMemo<LoadingContextValue>(
    () => ({ isLoading: isVisible, show, hide, withLoading }),
    [isVisible, show, hide, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isVisible && <LoadingOverlay message={message} />}
    </LoadingContext.Provider>
  );
}

/**
 * Truy cập Global Loading State — show()/hide() để bật/tắt overlay full-screen
 * từ bất kỳ component nào nằm trong LoadingProvider (Site hoặc Admin).
 */
export function useGlobalLoading(): LoadingContextValue {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useGlobalLoading phải được dùng bên trong LoadingProvider.");
  }

  return context;
}
