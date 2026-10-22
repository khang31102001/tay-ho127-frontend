/**
 * Công tắc tính năng của Site. Biến NEXT_PUBLIC_* được nhúng vào bundle lúc BUILD, nên đổi giá trị phải build/deploy lại.
 *
 * NEXT_PUBLIC_ENABLE_ORDERING=true bật đăng nhập khách, giỏ hàng và đặt món (môi trường UAT). Mặc định TẮT: production
 * chưa mở các tính năng này, chỉ hiển thị giới thiệu sản phẩm.
 */
export const ORDERING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ORDERING === "true";

/** Các trang thuộc luồng đăng nhập/đặt món. Khi ORDERING_ENABLED tắt, middleware chuyển chúng về /thuc-don. */
const ORDERING_ONLY_PATHS = ["/checkout", "/gio-hang", "/don-hang", "/payment", "/tai-khoan"] as const;

export function isOrderingOnlyPath(pathname: string): boolean {
  return ORDERING_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
