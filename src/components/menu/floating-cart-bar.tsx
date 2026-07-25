"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/data/menu-items";

/**
 * Thời gian thanh giỏ hàng hiển thị trước khi tự thu gọn.
 * 4.000 ms = 4 giây.
 */
const AUTO_COLLAPSE_DELAY = 4_000;

export function FloatingCartBar() {
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
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }, [cartItems]);

  /**
   * Xóa timer đang chạy.
   */
  function clearCollapseTimer() {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = undefined;
    }
  }

  /**
   * Tạo timer tự thu gọn thanh giỏ hàng.
   */
  function startCollapseTimer() {
    clearCollapseTimer();

    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, AUTO_COLLAPSE_DELAY);
  }

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
    const previousQuantity =
      previousQuantityRef.current;

    const hasAddedProduct =
      totalQuantity > previousQuantity;

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
  }, [totalQuantity]);

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

  /**
   * Khi giỏ hàng trống:
   * Không hiển thị thanh hoặc nút giỏ hàng.
   */
  if (totalQuantity === 0) {
    return null;
  }

  /**
   * Khi thanh đang thu gọn:
   * Hiển thị một nút giỏ hàng nhỏ ở góc phải.
   */
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={handleExpand}
        aria-label={`Mở giỏ hàng có ${totalQuantity} sản phẩm`}
        className="
          fixed bottom-5 right-5 z-50
          flex min-h-14 items-center gap-3
          rounded-full bg-[#ff9818]
          px-5 py-3 text-white
          shadow-[0_6px_24px_rgba(0,0,0,0.25)]
          transition
          hover:-translate-y-0.5
          hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)]
          active:scale-[0.97]
        "
      >
        {/* Icon giỏ hàng */}
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="20" r="1" />
          <circle cx="19" cy="20" r="1" />

          <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L21 7H6" />
        </svg>

        <span className="font-black">
          Giỏ hàng
        </span>

        {/* Badge số lượng */}
        <span
          className="
            flex h-6 min-w-6 items-center
            justify-center rounded-full
            bg-brand-red px-1.5
            text-xs font-black text-white
          "
        >
          {totalQuantity}
        </span>
      </button>
    );
  }

  /**
   * Thanh giỏ hàng đầy đủ.
   */
  return (
    <aside
      aria-label="Thông tin giỏ hàng"
      className="
        fixed inset-x-0 bottom-0 z-50
        border-t border-orange-600
        bg-[#ff9818]
        shadow-[0_-4px_16px_rgba(0,0,0,0.15)]
        animate-in slide-in-from-bottom
        duration-300
      "
    >
      <div
        className="
          relative mx-auto flex min-h-[78px]
          max-w-[790px] items-center
          justify-between gap-3
          px-5
          pb-[calc(12px+env(safe-area-inset-bottom))]
          pt-3
        "
      >
        {/* Thông tin số lượng */}
        <div className="min-w-0 font-bold text-white">
          <span className="block text-[16px] sm:text-[17px]">
            Giỏ hàng ({totalQuantity})
          </span>

          <span className="mt-0.5 block text-xs font-medium text-white/80 sm:hidden">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Tổng tiền */}
        <div className="ml-auto hidden text-right sm:block">
          <strong className="whitespace-nowrap text-[28px] font-black text-white">
            {formatCurrency(totalPrice)}
          </strong>
        </div>

        {/* Nút checkout */}
        <button
          type="button"
          onClick={handleCheckout}
          className="
            whitespace-nowrap rounded-md
            bg-[#f5222d] px-5 py-3
            text-[15px] font-black text-white
            transition
            hover:bg-[#d91823]
            active:scale-[0.97]
          "
        >
          Đặt ngay
        </button>

        {/* Nút thu gọn */}
        <button
          type="button"
          onClick={handleCollapse}
          aria-label="Thu gọn giỏ hàng"
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full text-[24px]
            font-medium text-white/90
            transition
            hover:bg-white/15
            hover:text-white
          "
        >
          ×
        </button>
      </div>
    </aside>
  );
}