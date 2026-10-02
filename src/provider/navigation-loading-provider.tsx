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
import { usePathname, useRouter } from "next/navigation";

import { NavigationProgress } from "@/components/shared/loading/NavigationProgress";

/**
 * Lưới an toàn: nếu pathname không đổi (redirect về chính nó, handler chặn điều
 * hướng, lỗi mạng...) thì tự gỡ loading, tránh overlay treo vĩnh viễn.
 * Không dùng để "giữ" loading — loading luôn kết thúc ngay khi route mới sẵn sàng.
 */
const STALL_TIMEOUT_MS = 10_000;

export type NavigationPhase = "idle" | "loading" | "done";

type NavigationLoadingContextValue = {
  phase: NavigationPhase;
  /** Bắt đầu loading điều hướng tới `href` (bỏ qua nếu cùng pathname hiện tại). */
  start: (href?: string) => void;
};

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

function getTargetPathname(href: string): string | null {
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin ? url.pathname : null;
  } catch {
    return null;
  }
}

/**
 * Route Loading dùng chung cho User Site và Admin Site (đặt ở root layout).
 * Tách biệt hoàn toàn với Initial App Loading (AppInitLoading): provider này
 * chỉ chạy khi đổi route sau khi app đã khởi tạo.
 *
 * Bắt điều hướng bằng 3 đường, không cần sửa từng <Link>:
 *  - click vào <a> nội bộ (gồm next/link) — listener ủy quyền ở document;
 *  - back/forward của trình duyệt — popstate;
 *  - router.push/replace — qua useNavigationRouter().
 * Kết thúc khi usePathname() đổi (route mới đã commit).
 */
export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<NavigationPhase>("idle");

  const pathnameRef = useRef(pathname);
  const phaseRef = useRef<NavigationPhase>("idle");
  const stallTimerRef = useRef<number | null>(null);
  const doneTimerRef = useRef<number | null>(null);

  const setPhaseBoth = useCallback((next: NavigationPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimers = useCallback(() => {
    if (stallTimerRef.current !== null) window.clearTimeout(stallTimerRef.current);
    if (doneTimerRef.current !== null) window.clearTimeout(doneTimerRef.current);
    stallTimerRef.current = null;
    doneTimerRef.current = null;
  }, []);

  const complete = useCallback(() => {
    if (phaseRef.current !== "loading") return;
    clearTimers();
    setPhaseBoth("done");
    // Chờ animation "hoàn tất + fade out" chạy xong rồi mới gỡ khỏi DOM.
    doneTimerRef.current = window.setTimeout(() => setPhaseBoth("idle"), 300);
  }, [clearTimers, setPhaseBoth]);

  const start = useCallback(
    (href?: string) => {
      if (href !== undefined) {
        const targetPathname = getTargetPathname(href);
        if (targetPathname === null || targetPathname === pathnameRef.current) return;
      }

      clearTimers();
      setPhaseBoth("loading");
      stallTimerRef.current = window.setTimeout(complete, STALL_TIMEOUT_MS);
    },
    [clearTimers, complete, setPhaseBoth],
  );

  // Route mới đã commit => hoàn tất.
  useEffect(() => {
    pathnameRef.current = pathname;
    complete();
  }, [pathname, complete]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      start(anchor.href);
    }

    function handlePopState() {
      // popstate bắn sau khi URL đã đổi: so với pathname đang hiển thị.
      if (window.location.pathname !== pathnameRef.current) start();
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
      clearTimers();
    };
  }, [start, clearTimers]);

  const value = useMemo(() => ({ phase, start }), [phase, start]);

  return (
    <NavigationLoadingContext.Provider value={value}>
      <NavigationProgress phase={phase} />
      {children}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading(): NavigationLoadingContextValue {
  const context = useContext(NavigationLoadingContext);

  if (!context) {
    throw new Error("useNavigationLoading phải được dùng bên trong NavigationLoadingProvider.");
  }

  return context;
}

/**
 * Thay cho useRouter() ở nơi điều hướng bằng code (router.push/replace): bật
 * loading ngay lúc gọi, phần còn lại giữ nguyên hành vi client-side của Next.
 */
export function useNavigationRouter() {
  const router = useRouter();
  const { start } = useNavigationLoading();

  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) => {
        start(href);
        router.push(href, options);
      },
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
        start(href);
        router.replace(href, options);
      },
    }),
    [router, start],
  );
}
