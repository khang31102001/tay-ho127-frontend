/**
 * Cookie phiên đăng nhập Admin (BFF — xem src/lib/auth/admin-backend-session.ts).
 * Tách riêng file hằng số để middleware (Edge runtime) không phải import cả
 * route handler.
 *
 * - ADMIN_SESSION_COOKIE: cờ "đang có phiên" (không chứa token) cho
 *   middleware.ts chặn /admin/* ở server. Sống bằng thời hạn refresh token.
 * - ADMIN_ACCESS_TOKEN_COOKIE / ADMIN_REFRESH_TOKEN_COOKIE: JWT do Backend cấp,
 *   HttpOnly và chỉ gửi tới /api/admin/* (BFF) — JavaScript phía trình duyệt
 *   không đọc được token.
 */
export const ADMIN_SESSION_COOKIE = "tayho_admin_session";
export const ADMIN_ACCESS_TOKEN_COOKIE = "tayho_admin_at";
export const ADMIN_REFRESH_TOKEN_COOKIE = "tayho_admin_rt";

/** Path của cookie token — chỉ Route Handler BFF (/api/admin/*) nhận được. */
export const ADMIN_TOKEN_COOKIE_PATH = "/api/admin";
