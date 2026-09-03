const CART_REVIEWED_STORAGE_KEY = "tayho-cart-reviewed";

/**
 * Đánh dấu người dùng vừa bấm "Tiến hành đặt hàng" ở Cart Page (/gio-hang).
 * Checkout (/checkout) dùng cờ này để chặn truy cập trực tiếp — bắt buộc
 * luồng đặt hàng phải đi qua bước review giỏ hàng trước.
 */
export function markCartReviewed(): void {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(CART_REVIEWED_STORAGE_KEY, "1");
}

/**
 * Đọc cờ đã review rồi xóa ngay — chỉ hợp lệ cho đúng 1 lần vào Checkout.
 * Tải lại /checkout hoặc vào thẳng bằng URL sẽ không còn cờ này, buộc quay
 * lại /gio-hang để review lại.
 */
export function consumeCartReviewedFlag(): boolean {
  if (typeof window === "undefined") return false;

  const isReviewed = window.sessionStorage.getItem(CART_REVIEWED_STORAGE_KEY) === "1";
  window.sessionStorage.removeItem(CART_REVIEWED_STORAGE_KEY);

  return isReviewed;
}
