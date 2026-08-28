import type {
  AuthResponse,
  AuthSuccessResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ForgotPasswordSuccessResponse,
  LoginCredentials,
  RegisterPayload,
  RegisterResponse,
  RegisterSuccessResponse,
} from "../types/auth.types";

import { readApiResponse } from "@/services/api-client";

const API_ENDPOINTS = {
  login: "/api/auth/login",
  google: "/api/auth/google",
  register: "/api/auth/register",
  forgotPassword: "/api/auth/forgot-password",
} as const;

export async function loginWithCredentials(
  credentials: LoginCredentials,
): Promise<AuthSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return readApiResponse<AuthResponse>(response, "Đăng nhập thất bại.");
}

export async function loginWithGoogle(): Promise<AuthSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.google, {
    method: "POST",
  });

  return readApiResponse<AuthResponse>(response, "Đăng nhập Google thất bại.");
}

export async function registerAccount(
  payload: RegisterPayload,
): Promise<RegisterSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.register, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse<RegisterResponse>(response, "Đăng ký thất bại.");
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.forgotPassword, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse<ForgotPasswordResponse>(
    response,
    "Gửi yêu cầu lấy lại mật khẩu thất bại.",
  );
}
