import type {
  AdminAuthResponse,
  AdminAuthSuccessResponse,
  AdminLoginCredentials,
} from "../types/admin-auth.types";

import { readApiResponse } from "@/services/api-client";

const API_ENDPOINTS = {
  login: "/api/admin/auth/login",
  logout: "/api/admin/auth/logout",
} as const;

export async function loginAdmin(
  credentials: AdminLoginCredentials,
): Promise<AdminAuthSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return readApiResponse<AdminAuthResponse>(response, "Đăng nhập thất bại.");
}

/** Xóa cookie phiên đăng nhập (xem middleware.ts) — gọi song song với việc xóa localStorage phía context. */
export async function logoutAdmin(): Promise<void> {
  await fetch(API_ENDPOINTS.logout, { method: "POST" });
}
