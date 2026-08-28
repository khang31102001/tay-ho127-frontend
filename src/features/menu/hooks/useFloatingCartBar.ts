"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart";

/**
 * Thời gian thanh giỏ hàng hiển thị trước khi tự thu gọn.
 * 4.000 ms = 4 giây.
 */
const AUTO_COLLAPSE_DELAY = 4_000;

export function useFloatingCartBar() {
  const router = useRouter();

  const { cartItems, totalPrice } = useCart();

  /**
   * Trạng thái thanh giỏ hàng:
   * true  -> Hiện thanh đầy đủ.
   * false -> Thu gọn thành nút giỏ hàng nhỏ.
   */
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Lưu số lượng sản phẩm trước đó.
   * Dùng để nhận biết người dùng vừa thêm sản phẩm.
   */
  const previousQuantityRef = useRef(0);

  /**
   * Lưu timer để có thể xóa timer cũ
   * trước khi tạo một timer mới.
   */
  const collapseTimerRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  /**
   * Tính tổng số lượng món trong giỏ hàng.
   *
   * Ví dụ:
   * - Bánh cuốn: 2
   * - Chả lụa: 1
   * => totalQuantity = 3
   */
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  /**
   * Xóa timer đang chạy.
   */
  const clearCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = undefined;
    }
  }, []);

  /**
   * Tạo timer tự thu gọn thanh giỏ hàng.
   */
  const startCollapseTimer = useCallback(() => {
    clearCollapseTimer();

    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, AUTO_COLLAPSE_DELAY);
  }, [clearCollapseTimer]);

  /**
   * Theo dõi sự thay đổi của tổng số lượng sản phẩm.
   *
   * Khi số lượng tăng:
   * - Hiển thị thanh giỏ hàng.
   * - Bắt đầu đếm 4 giây để tự thu gọn.
   *
   * Khi giỏ hàng trống:
   * - Ẩn toàn bộ component.
   */
  useEffect(() => {
    const previousQuantity = previousQuantityRef.current;

    const hasAddedProduct = totalQuantity > previousQuantity;

    if (totalQuantity === 0) {
      setIsExpanded(false);
      clearCollapseTimer();
    } else if (hasAddedProduct) {
      setIsExpanded(true);
      startCollapseTimer();
    }

    previousQuantityRef.current = totalQuantity;

    return () => {
      clearCollapseTimer();
    };
  }, [totalQuantity, clearCollapseTimer, startCollapseTimer]);

  /**
   * Chuyển người dùng đến trang checkout.
   */
  function handleCheckout() {
    clearCollapseTimer();
    router.push("/checkout");
  }

  /**
   * Mở thanh giỏ hàng từ nút thu gọn.
   */
  function handleExpand() {
    setIsExpanded(true);
    startCollapseTimer();
  }

  /**
   * Thu gọn thanh giỏ hàng bằng nút đóng.
   */
  function handleCollapse() {
    clearCollapseTimer();
    setIsExpanded(false);
  }

  return {
    isExpanded,
    totalQuantity,
    totalPrice,
    handleCheckout,
    handleExpand,
    handleCollapse,
  };
}
