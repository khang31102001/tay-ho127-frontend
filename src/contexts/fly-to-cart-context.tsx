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
import { createPortal } from "react-dom";

import { FlyingProduct } from "@/components/cart/FlyToCart";

const FLIGHT_DURATION_MS = 700;
const PULSE_DURATION_MS = 260;

type FlyToCartOptions = {
  /** DOM node của ảnh sản phẩm được click, dùng để lấy vị trí bắt đầu. */
  sourceElement: HTMLElement | null;
  imageUrl: string;
};

type FlyToCartContextType = {
  /** Header/MobileHeaderMenu gọi để đăng ký vị trí icon giỏ hàng làm điểm đến. */
  registerCartTarget: (key: string, element: HTMLElement | null) => void;
  flyToCart: (options: FlyToCartOptions) => void;
};

type FlyingItem = {
  id: number;
  imageUrl: string;
  startRect: DOMRect;
  targetRect: DOMRect;
  targetElement: HTMLElement;
};

const FlyToCartContext = createContext<FlyToCartContextType | null>(null);

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function pulseCartTarget(element: HTMLElement) {
  element.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.15)" },
      { transform: "scale(1)" },
    ],
    { duration: PULSE_DURATION_MS, easing: "ease-out" },
  );
}

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  // Có thể có nhiều target (desktop + mobile) cùng lúc; chỉ target đang
  // thực sự hiển thị trên viewport mới được dùng làm điểm đến.
  const targetsRef = useRef<Map<string, HTMLElement>>(new Map());
  const nextIdRef = useRef(0);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const registerCartTarget = useCallback(
    (key: string, element: HTMLElement | null) => {
      if (element) {
        targetsRef.current.set(key, element);
      } else {
        targetsRef.current.delete(key);
      }
    },
    [],
  );

  const getVisibleTarget = useCallback((): HTMLElement | null => {
    for (const element of targetsRef.current.values()) {
      const rect = element.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        return element;
      }
    }

    return null;
  }, []);

  const handleFlightComplete = useCallback(
    (id: number, targetElement: HTMLElement) => {
      pulseCartTarget(targetElement);
      setFlyingItems((items) => items.filter((item) => item.id !== id));
    },
    [],
  );

  const flyToCart = useCallback(
    ({ sourceElement, imageUrl }: FlyToCartOptions) => {
      if (!sourceElement) {
        return;
      }

      const startRect = sourceElement.getBoundingClientRect();

      // Đợi 1 microtask để đảm bảo cart badge (mount khi cartCount chuyển 0 -> 1,
      // do addToCart gọi ngay trước flyToCart) đã được React commit vào DOM
      // trước khi đo vị trí target. Dùng microtask thay vì requestAnimationFrame
      // vì rAF bị trình duyệt tạm dừng khi tab/pane không hiển thị, còn microtask
      // luôn chạy ngay sau khi event handler đồng bộ (nơi React đã flush commit) kết thúc.
      Promise.resolve().then(() => {
        const targetElement = getVisibleTarget();

        if (!targetElement) {
          return;
        }

        if (prefersReducedMotion()) {
          return;
        }

        const targetRect = targetElement.getBoundingClientRect();
        const id = nextIdRef.current++;

        setFlyingItems((items) => [
          ...items,
          { id, imageUrl, startRect, targetRect, targetElement },
        ]);
      });
    },
    [getVisibleTarget],
  );

  const value = useMemo<FlyToCartContextType>(
    () => ({ registerCartTarget, flyToCart }),
    [registerCartTarget, flyToCart],
  );

  return (
    <FlyToCartContext.Provider value={value}>
      {children}
      {isMounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[9999]">
            {flyingItems.map((item) => (
              <FlyingProduct
                key={item.id}
                imageUrl={item.imageUrl}
                startRect={item.startRect}
                targetRect={item.targetRect}
                duration={FLIGHT_DURATION_MS}
                onComplete={() =>
                  handleFlightComplete(item.id, item.targetElement)
                }
              />
            ))}
          </div>,
          document.body,
        )}
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart(): FlyToCartContextType {
  const context = useContext(FlyToCartContext);

  if (!context) {
    throw new Error(
      "useFlyToCart phải được sử dụng bên trong FlyToCartProvider",
    );
  }

  return context;
}
