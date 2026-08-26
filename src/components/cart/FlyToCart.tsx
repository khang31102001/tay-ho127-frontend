"use client";

import { useEffect, useRef } from "react";

type FlyingProductProps = {
  imageUrl: string;
  startRect: DOMRect;
  targetRect: DOMRect;
  duration: number;
  onComplete: () => void;
};

/**
 * Một ảnh sản phẩm "ma" bay từ ProductCard tới icon giỏ hàng.
 * Dùng Web Animations API vì tọa độ start/target là động theo từng lần click,
 * không thể biểu diễn bằng @keyframes tĩnh trong CSS.
 */
export function FlyingProduct({
  imageUrl,
  startRect,
  targetRect,
  duration,
  onComplete,
}: FlyingProductProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      onComplete();
      return;
    }

    const startCenterX = startRect.left + startRect.width / 2;
    const startCenterY = startRect.top + startRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Điểm giữa được nâng lên trên để tạo đường bay cong nhẹ thay vì bay thẳng.
    const liftCenterX = (startCenterX + targetCenterX) / 2;
    const liftCenterY =
      Math.min(startCenterY, targetCenterY) - Math.max(60, startRect.height * 0.6);

    const animation = element.animate(
      [
        {
          offset: 0,
          transform: "translate3d(0, 0, 0) scale(1)",
          opacity: 1,
          borderRadius: "8px",
        },
        {
          offset: 0.3,
          transform: `translate3d(${liftCenterX - startCenterX}px, ${liftCenterY - startCenterY}px, 0) scale(0.75)`,
          opacity: 1,
          borderRadius: "16px",
        },
        {
          offset: 1,
          transform: `translate3d(${targetCenterX - startCenterX}px, ${targetCenterY - startCenterY}px, 0) scale(0.18)`,
          opacity: 0.3,
          borderRadius: "50%",
        },
      ],
      {
        duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      },
    );

    animation.addEventListener("finish", onComplete);
    animation.addEventListener("cancel", onComplete);

    return () => {
      animation.removeEventListener("finish", onComplete);
      animation.removeEventListener("cancel", onComplete);
      animation.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={elementRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: startRect.left,
        top: startRect.top,
        width: startRect.width,
        height: startRect.height,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        willChange: "transform, opacity",
      }}
    />
  );
}
