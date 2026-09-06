"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { useCart, useFlyToCart } from "@/features/cart";
import type { ProductDetail } from "../types/menu.types";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 20;

/**
 * Không còn chọn Modifier ở trang chi tiết sản phẩm — Nước mắm/Rau... giờ là
 * General Order Options, chọn 1 lần cho cả đơn ở Mini Cart/Cart Page (xem
 * features/order-options + features/cart useOrderOptions). Hook này chỉ còn
 * quản lý số lượng + add to cart.
 */
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
      productId: product.id,
      name: product.name,
      basePrice: product.price,
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

  /**
   * "Đặt ngay" thêm món vào giỏ rồi đưa thẳng tới Cart Page (/gio-hang) để
   * khách review giỏ hàng — không nhảy thẳng /checkout (Checkout bắt buộc
   * phải đi qua Cart Review trước, xem cart-review.service.ts).
   */
  function handleOrderNow(event: MouseEvent<HTMLButtonElement>) {
    addSelectedQuantityToCart(event.currentTarget);
    router.push("/gio-hang");
  }

  return {
    quantity,
    handleIncrement,
    handleDecrement,
    handleAddToCart,
    handleOrderNow,
    unitPrice: product.price,
  };
}
