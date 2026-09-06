"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type QuantityStepperSize = "sm" | "md" | "lg";

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Số lượng tối thiểu — nút giảm bị disable khi chạm mức này. Mặc định 1. */
  min?: number;
  size?: QuantityStepperSize;
  className?: string;
};

const SIZE_CLASSES: Record<QuantityStepperSize, { button: string; icon: number; label: string }> = {
  sm: { button: "h-6 w-6", icon: 12, label: "w-6 text-xs" },
  md: { button: "h-9 w-9", icon: 16, label: "w-8 text-[16px]" },
  lg: { button: "h-10 w-10", icon: 16, label: "w-10 text-[15px]" },
};

/**
 * UI Primitive [-] n [+] — không biết business logic (không tự tính giá,
 * không tự gọi Cart), chỉ nhận quantity hiện tại + 2 callback. Gộp lại từ 4
 * chỗ đang tự vẽ cùng 1 UI khác size (ProductActions, QuickAddModal,
 * CartPageSection, MiniCartItem) để CartItemEditor/CartItemRow dùng chung
 * thay vì lặp lần thứ 5.
 */
export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  size = "md",
  className,
}: QuantityStepperProps) {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= min}
        aria-label="Giảm số lượng"
        className={cn(
          "flex items-center justify-center rounded-md border border-brand-line text-brand-ink transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40",
          sizeClasses.button,
        )}
      >
        <Minus size={sizeClasses.icon} />
      </button>

      <span className={cn("text-center font-bold text-brand-ink", sizeClasses.label)}>{quantity}</span>

      <button
        type="button"
        onClick={onIncrement}
        aria-label="Tăng số lượng"
        className={cn(
          "flex items-center justify-center rounded-md border border-brand-line text-brand-ink transition hover:bg-brand-cream",
          sizeClasses.button,
        )}
      >
        <Plus size={sizeClasses.icon} />
      </button>
    </div>
  );
}
