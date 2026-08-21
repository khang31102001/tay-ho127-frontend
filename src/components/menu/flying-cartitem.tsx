"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { createPortal } from "react-dom";

/* ============================================================
 * TYPES
 * ========================================================== */

export type FlyingCartItemData = {
  id: string;
  image: string;
  sourceRect: DOMRect;
  targetRect: DOMRect;
};

type FlyingCartItemProps = {
  item: FlyingCartItemData;
  onComplete: (id: string) => void;
};

/* ============================================================
 * COMPONENT
 * ========================================================== */

export function FlyingCartItem({
  item,
  onComplete,
}: FlyingCartItemProps) {
  if (typeof document === "undefined") {
    return null;
  }

  const itemSize = 72;

  /* ==========================================================
   * SOURCE POSITION
   * ======================================================== */

  const startX =
    item.sourceRect.left +
    item.sourceRect.width / 2 -
    itemSize / 2;

  const startY =
    item.sourceRect.top +
    item.sourceRect.height / 2 -
    itemSize / 2;

  /* ==========================================================
   * TARGET POSITION
   * ======================================================== */

  const endX =
    item.targetRect.left +
    item.targetRect.width / 2 -
    itemSize / 2;

  const endY =
    item.targetRect.top +
    item.targetRect.height / 2 -
    itemSize / 2;

  const distanceX = endX - startX;
  const distanceY = endY - startY;

  return createPortal(
    <motion.div
      className="
        pointer-events-none
        fixed
        z-[9999]
        overflow-hidden
        rounded-full
        border-2 border-white
        bg-white
        shadow-[0_12px_30px_rgba(0,0,0,0.25)]
      "
      style={{
        left: startX,
        top: startY,
        width: itemSize,
        height: itemSize,
      }}
      initial={{
        scale: 0.75,
        opacity: 0,
        rotate: -8,
      }}
      animate={{
        /*
         * X di chuyển dần về giỏ hàng.
         */
        x: [
          0,
          distanceX * 0.5,
          distanceX,
        ],

        /*
         * Y tạo đường cong:
         * món ăn bật nhẹ lên trước khi rơi vào cart.
         */
        y: [
          0,
          distanceY * 0.42 - 80,
          distanceY,
        ],

        scale: [
          0.75,
          1,
          0.22,
        ],

        opacity: [
          0,
          1,
          1,
        ],

        rotate: [
          -8,
          4,
          12,
        ],
      }}
      transition={{
        duration: 0.68,
        times: [0, 0.45, 1],
        ease: ["easeOut", "easeIn"],
      }}
      onAnimationComplete={() => {
        onComplete(item.id);
      }}
    >
      <Image
        src={item.image}
        alt=""
        fill
        sizes="72px"
        className="object-cover"
      />
    </motion.div>,
    document.body,
  );
}