import type { AdminLoginCredentials, AdminUser } from "../types/admin-auth.types";

import { createHttpClient } from "@/lib/http/api-client";
import { isApiError } from "@/lib/http/api-error";

/**
 * Đăng nhập Admin qua BFF Route Handler cùng origin (app/api/admin/auth/*) —
 * BFF gọi Backend ASP.NET Core và giữ token trong cookie HttpOnly (xem
 * src/lib/auth/admin-backend-session.ts). Client cùng origin ("") thay vì `api`
 * mặc định, vì `api` trỏ theo NEXT_PUBLIC_API_URL.
 */
const bffClient = createHttpClient("");

const API_ENDPOINTS = {
  login: "/api/admin/auth/login",
  logout: "/api/admin/auth/logout",
  session: "/api/admin/auth/session",
} as const;

export async function loginAdmin(credentials: AdminLoginCredentials): Promise<AdminUser> {
  const { user } = await bffClient.post<{ user: AdminUser }, AdminLoginCredentials>(API_ENDPOINTS.login, credentials);
  return user;
}

/** Admin của phiên hiện tại, hoặc null nếu chưa đăng nhập / phiên đã hết hạn. */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const { user } = await bffClient.get<{ user: AdminUser }>(API_ENDPOINTS.session);
    return user;
  } catch (error) {
    if (isApiError(error) && error.kind === "unauthorized") {
      return null;
    }
    throw error;
  }
}

/** Thu hồi phiên ở Backend và xóa cookie phiên. */
export async function logoutAdmin(): Promise<void> {
  await bffClient.post<unknown>(API_ENDPOINTS.logout);
}
