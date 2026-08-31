/**
 * Tên cookie phiên đăng nhập Admin — dùng chung giữa middleware.ts (kiểm tra
 * ở server/edge) và app/api/admin/auth/{login,logout} (set/clear cookie).
 * Tách riêng file hằng số để middleware (chạy Edge runtime) không phải import
 * cả route handler.
 */
export const ADMIN_SESSION_COOKIE = "tayho_admin_session";

/** 7 ngày — MOCK CONTRACT, backend thật nên quyết định thời hạn theo policy thật. */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
