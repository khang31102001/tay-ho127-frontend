"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Import thẳng (không qua barrel) — lý do đầy đủ xem features/menu/services/menu.service.ts.
import { useCart, type CartItemModifierSelection, type CartProduct } from "@/features/cart";
import { getProductById } from "@/features/products/services/product.service";
import { getModifierGroupById } from "@/features/modifier-groups/services/modifier-group.service";
import type { ManagedOrder } from "../types/order.types";

export type ReorderResult = {
  addedCount: number;
  skippedCount: number;
};

/**
 * #19 Reorder — tạo Cart MỚI từ Order cũ, KHÔNG sửa Order cũ (Order là dữ
 * liệu lịch sử, snapshot). Giá/tên lấy lại từ Catalog HIỆN TẠI (không dùng
 * snapshot cũ trong OrderItem) — món có thể đã đổi giá; món ngừng bán/không
 * còn active thì bỏ qua thay vì chặn toàn bộ reorder. Modifier cũ nào không
 * còn tồn tại (Admin đã xóa/đổi) cũng bỏ qua tương tự resolveOrderItemModifiers
 * ở order.service.ts, không chặn cả dòng hàng.
 */
export function useReorder() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isReordering, setIsReordering] = useState(false);

  async function reorder(order: ManagedOrder): Promise<ReorderResult> {
    setIsReordering(true);
    let addedCount = 0;
    let skippedCount = 0;

    try {
      for (const item of order.items) {
        const product = await getProductById(item.productId);

        if (!product || product.status !== "active") {
          skippedCount += 1;
          continue;
        }

        const modifiers: CartItemModifierSelection[] = [];

        for (const snapshot of item.modifiers ?? []) {
          const group = await getModifierGroupById(snapshot.groupId);
          const option = group?.options.find((candidate) => candidate.id === snapshot.optionId);

          if (group && option) {
            modifiers.push({
              groupId: group.id,
              groupName: group.name,
              optionId: option.id,
              optionLabel: option.label,
              priceAdjustment: option.priceAdjustment,
            });
          }
        }

        const cartProduct: CartProduct = {
          productId: product.id,
          name: product.name,
          basePrice: product.price,
          // Dùng lại ảnh snapshot của Order — sai lệch ảnh không ảnh hưởng tiền, không cần tra lại Media.
          image: item.productImage,
          modifiers,
          specialInstructions: item.note,
        };

        for (let i = 0; i < item.quantity; i += 1) {
          addToCart(cartProduct);
        }

        addedCount += 1;
      }

      router.push("/gio-hang");
    } finally {
      setIsReordering(false);
    }

    return { addedCount, skippedCount };
  }

  return { reorder, isReordering };
}
