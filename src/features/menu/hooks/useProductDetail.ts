"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { useCart, useFlyToCart } from "@/features/cart";
import type { ProductDetail } from "../types/menu.types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 20;

export function useProductDetail(product: ProductDetail) {
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();
  const router = useRouter();

  const [quantity, setQuantity] = useState(MIN_QUANTITY);

  function handleIncrement() {
    setQuantity((current) => Math.min(current + 1, MAX_QUANTITY));
  }

  function handleDecrement() {
    setQuantity((current) => Math.max(current - 1, MIN_QUANTITY));
  }

  /**
   * addToCart chỉ cộng dồn 1 đơn vị mỗi lần gọi (xem cart-context.tsx),
   * nên số lượng chọn ở trang chi tiết được cộng dồn bằng cách gọi lặp
   * lại thay vì đổi API dùng chung của giỏ hàng.
   */
  function addSelectedQuantityToCart(sourceElement: HTMLElement) {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    };

    for (let i = 0; i < quantity; i += 1) {
      addToCart(cartProduct);
    }

    flyToCart({ sourceElement, imageUrl: product.image });
  }

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    addSelectedQuantityToCart(event.currentTarget);
  }

  function handleOrderNow(event: MouseEvent<HTMLButtonElement>) {
    addSelectedQuantityToCart(event.currentTarget);
    router.push("/checkout");
  }

  return {
    quantity,
    handleIncrement,
    handleDecrement,
    handleAddToCart,
    handleOrderNow,
  };
}
