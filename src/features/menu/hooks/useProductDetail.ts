"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { useCart, useFlyToCart, type CartItemModifierSelection } from "@/features/cart";
import type { ManagedModifierGroup } from "@/features/modifier-groups/types/modifier-group.types";
import type { ProductDetail } from "../types/menu.types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 20;

/** groupId -> danh sách optionId đang chọn. Khởi tạo từ option isDefault của từng nhóm. */
function buildInitialSelection(groups: ManagedModifierGroup[]): Record<string, string[]> {
  const initial: Record<string, string[]> = {};

  groups.forEach((group) => {
    const defaultOptionIds = group.options.filter((option) => option.isDefault).map((option) => option.id);
    initial[group.id] = group.selectionType === "single" ? defaultOptionIds.slice(0, 1) : defaultOptionIds;
  });

  return initial;
}

export function useProductDetail(product: ProductDetail) {
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();
  const router = useRouter();

  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [selectedOptionIdsByGroup, setSelectedOptionIdsByGroup] = useState<Record<string, string[]>>(() =>
    buildInitialSelection(product.modifierGroups),
  );

  function handleIncrement() {
    setQuantity((current) => Math.min(current + 1, MAX_QUANTITY));
  }

  function handleDecrement() {
    setQuantity((current) => Math.max(current - 1, MIN_QUANTITY));
  }

  function handleToggleModifierOption(group: ManagedModifierGroup, optionId: string) {
    setSelectedOptionIdsByGroup((previous) => {
      const current = previous[group.id] ?? [];

      if (group.selectionType === "single") {
        return { ...previous, [group.id]: [optionId] };
      }

      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...previous, [group.id]: next };
    });
  }

  /** Danh sách modifier đã chọn ở dạng đầy đủ (kèm label/giá) — dùng để hiển thị và đưa vào CartItem. */
  const selectedModifiers = useMemo<CartItemModifierSelection[]>(() => {
    const selections: CartItemModifierSelection[] = [];

    product.modifierGroups.forEach((group) => {
      const optionIds = selectedOptionIdsByGroup[group.id] ?? [];

      group.options.forEach((option) => {
        if (optionIds.includes(option.id)) {
          selections.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionLabel: option.label,
            priceAdjustment: option.priceAdjustment,
          });
        }
      });
    });

    return selections;
  }, [product.modifierGroups, selectedOptionIdsByGroup]);

  const modifiersPriceAdjustment = useMemo(
    () => selectedModifiers.reduce((sum, modifier) => sum + modifier.priceAdjustment, 0),
    [selectedModifiers],
  );

  const unitPrice = product.price + modifiersPriceAdjustment;

  /** Nhóm bắt buộc nhưng chưa chọn option nào (vd. nhóm required không có option isDefault) — chặn thêm vào giỏ. */
  const hasMissingRequiredModifier = product.modifierGroups.some(
    (group) => group.isRequired && (selectedOptionIdsByGroup[group.id] ?? []).length === 0,
  );

  /**
   * addToCart chỉ cộng dồn 1 đơn vị mỗi lần gọi (xem cart-context.tsx),
   * nên số lượng chọn ở trang chi tiết được cộng dồn bằng cách gọi lặp
   * lại thay vì đổi API dùng chung của giỏ hàng.
   */
  function addSelectedQuantityToCart(sourceElement: HTMLElement) {
    const cartProduct = {
      productId: product.id,
      name: product.name,
      price: unitPrice,
      image: product.image,
      modifiers: selectedModifiers,
    };

    for (let i = 0; i < quantity; i += 1) {
      addToCart(cartProduct);
    }

    flyToCart({ sourceElement, imageUrl: product.image });
  }

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    if (hasMissingRequiredModifier) return;
    addSelectedQuantityToCart(event.currentTarget);
  }

  function handleOrderNow(event: MouseEvent<HTMLButtonElement>) {
    if (hasMissingRequiredModifier) return;
    addSelectedQuantityToCart(event.currentTarget);
    router.push("/checkout");
  }

  return {
    quantity,
    handleIncrement,
    handleDecrement,
    handleAddToCart,
    handleOrderNow,
    selectedOptionIdsByGroup,
    handleToggleModifierOption,
    unitPrice,
    hasMissingRequiredModifier,
  };
}
