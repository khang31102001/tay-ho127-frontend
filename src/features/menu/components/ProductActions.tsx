"use client";

import { Minus, Plus } from "lucide-react";

import { formatCurrency } from "@/lib/format-currency";
import type { ProductDetail } from "../types/menu.types";
import { useProductDetail } from "../hooks/useProductDetail";
import { ModifierSelector } from "./ModifierSelector";

type ProductActionsProps = {
  product: ProductDetail;
};

export function ProductActions({ product }: ProductActionsProps) {
  const {
    quantity,
    handleIncrement,
    handleDecrement,
    handleAddToCart,
    handleOrderNow,
    selectedOptionIdsByGroup,
    handleToggleModifierOption,
    unitPrice,
    hasMissingRequiredModifier,
  } = useProductDetail(product);

  return (
    <div className="flex flex-col gap-4">
      {product.modifierGroups.length > 0 && (
        <ModifierSelector
          groups={product.modifierGroups}
          selectedOptionIdsByGroup={selectedOptionIdsByGroup}
          onToggleOption={handleToggleModifierOption}
        />
      )}

      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-brand-ink">Số lượng</span>

        <div className="flex items-center rounded-md border border-brand-line">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
            className="flex h-10 w-10 items-center justify-center text-brand-ink transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} />
          </button>

          <span className="w-10 text-center text-[15px] font-bold text-brand-ink">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            aria-label="Tăng số lượng"
            className="flex h-10 w-10 items-center justify-center text-brand-ink transition hover:bg-brand-cream"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {hasMissingRequiredModifier && (
        <p className="text-[13px] font-bold text-brand-red">Vui lòng chọn đủ các tùy chọn bắt buộc (*) ở trên.</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={hasMissingRequiredModifier}
          className="flex h-12 flex-1 items-center justify-center rounded-md border-2 border-brand-red bg-white text-[15px] font-bold text-brand-red transition hover:bg-brand-red hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-brand-red"
        >
          Thêm vào giỏ
        </button>

        <button
          type="button"
          onClick={handleOrderNow}
          disabled={hasMissingRequiredModifier}
          className="flex h-12 flex-1 items-center justify-center rounded-md bg-brand-red text-[15px] font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Đặt ngay · {formatCurrency(unitPrice * quantity)}
        </button>
      </div>
    </div>
  );
}
