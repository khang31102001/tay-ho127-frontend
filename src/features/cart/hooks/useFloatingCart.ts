"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { useScrollThreshold } from "@/hooks/useScrollThreshold";

import { useCart } from "../context/cart-context";
import { useFlyToCart } from "../context/fly-to-cart-context";
import { useMiniCart } from "../context/mini-cart-context";

/**
 * Thời gian thanh giỏ hàng hiển thị đầy đủ trước khi tự thu gọn về nút tròn.
 * 4.000 ms = 4 giây.
 */
const AUTO_COLLAPSE_DELAY = 4_000;

/**
 * Gộp logic của 2 cart trigger nổi từng tồn tại tách rời — nút tròn mở Mini
 * Cart khi đã scroll (cũ: FloatingCart) và thanh "vừa thêm món" chỉ render
 * riêng ở trang thực đơn (cũ: FloatingCartBar) — thành một state duy nhất,
 * để 2 UI không còn hiển thị chồng nhau trên cùng một trang.
 */
export function useFloatingCart() {
  const router = useRouter();
  const isScrolled = useScrollThreshold();
  const { cartCount, totalPrice } = useCart();
  const { registerCartTarget } = useFlyToCart();
  const { toggle: toggleMiniCart } = useMiniCart();

  /**
   * Trạng thái thanh giỏ hàng:
   * true  -> hiện thanh đầy đủ (số lượng + tổng tiền + nút Đặt ngay).
   * false -> thu gọn thành nút tròn mở Mini Cart.
   */
  const [isExpanded, setIsExpanded] = useState(false);

  /** Lưu số lượng sản phẩm trước đó để nhận biết người dùng vừa thêm sản phẩm. */
  const previousQuantityRef = useRef(0);

  /** Lưu timer để có thể xóa timer cũ trước khi tạo timer mới. */
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = undefined;
    }
  }, []);

  const startCollapseTimer = useCallback(() => {
    clearCollapseTimer();

    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, AUTO_COLLAPSE_DELAY);
  }, [clearCollapseTimer]);

  /**
   * Khi số lượng tăng (vừa thêm sản phẩm): hiện thanh đầy đủ rồi tự thu gọn
   * sau AUTO_COLLAPSE_DELAY. Khi giỏ hàng trống: thu gọn và ẩn toàn bộ.
   */
  useEffect(() => {
    const previousQuantity = previousQuantityRef.current;
    const hasAddedProduct = cartCount > previousQuantity;

    if (cartCount === 0) {
      setIsExpanded(false);
      clearCollapseTimer();
    } else if (hasAddedProduct) {
      setIsExpanded(true);
      startCollapseTimer();
    }

    previousQuantityRef.current = cartCount;

    return () => {
      clearCollapseTimer();
    };
  }, [cartCount, clearCollapseTimer, startCollapseTimer]);

  /**
   * Trước khi scroll qua ngưỡng: chỉ hiện khi vừa thêm sản phẩm (thanh thông
   * báo tự thu gọn). Sau khi scroll: luôn hiện — cùng ngưỡng Header dùng để
   * ẩn Header Cart (state 1 -> state 2, xem Header.tsx).
   */
  const isVisible = cartCount > 0 && (isScrolled || isExpanded);

  function handleCheckout() {
    clearCollapseTimer();
    router.push("/gio-hang");
  }

  function handleCollapse() {
    clearCollapseTimer();
    setIsExpanded(false);
  }

  return {
    isVisible,
    isExpanded,
    cartCount,
    totalPrice,
    registerCartTarget,
    toggleMiniCart,
    handleCheckout,
    handleCollapse,
  };
}
