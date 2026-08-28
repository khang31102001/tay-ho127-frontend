import type {
  AdminAuthResponse,
  AdminAuthSuccessResponse,
  AdminLoginCredentials,
} from "../types/admin-auth.types";

import { readApiResponse } from "@/services/api-client";

const API_ENDPOINTS = {
  login: "/api/admin/auth/login",
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
