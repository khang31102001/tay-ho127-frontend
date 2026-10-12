/**
 * Cookie phiên đăng nhập KHÁCH HÀNG của Site (BFF — xem src/lib/auth/customer-backend-session.ts), tách hẳn khỏi cookie
 * Admin (admin-session-cookie.ts): hai "realm" khác nhau, không dùng chung token.
 *
 * Cả hai cookie đều HttpOnly — JavaScript phía trình duyệt không đọc được token; chỉ Route Handler dưới /api/* nhận được
 * (path "/api") và tự gắn `Authorization: Bearer` khi gọi Backend.
 */
export const CUSTOMER_ACCESS_TOKEN_COOKIE = "tayho_customer_at";
export const CUSTOMER_REFRESH_TOKEN_COOKIE = "tayho_customer_rt";

/** Path của cookie token — chỉ Route Handler (/api/*) nhận được, không gửi kèm khi tải trang. */
export const CUSTOMER_TOKEN_COOKIE_PATH = "/api";
