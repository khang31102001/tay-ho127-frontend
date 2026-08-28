"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

type AnimationType = "fade-up" | "slide-left" | "slide-right" | "zoom-in";

interface RevealProps {
  children: ReactNode;
  className?: string;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
}

const animations = {
  "fade-up": {
    opacity: 0,
    y: 60,
    x: 0,
    scale: 1,
  },

  "slide-left": {
    opacity: 0,
    y: 0,
    x: -80,
    scale: 1,
  },

  "slide-right": {
    opacity: 0,
    y: 0,
    x: 80,
    scale: 1,
  },

  "zoom-in": {
    opacity: 0,
    y: 0,
    x: 0,
    scale: 0.85,
  },
};

export function Reveal({
  children,
  className,
  type = "fade-up",
  delay = 0,
  duration = 0.8,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      initial={animations[type]}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once,
        amount: 0.3,
      }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}