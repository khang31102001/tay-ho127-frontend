import type {
  AuthResponse,
  AuthSuccessResponse,
  AuthUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ForgotPasswordSuccessResponse,
  LoginCredentials,
  RegisterPayload,
  RegistrationOtpResponse,
  RegistrationOtpSuccessResponse,
  VerifyRegistrationPayload,
} from "../types/auth.types";

import { readApiResponse } from "@/core/api/read-api-response";

/**
 * Đăng nhập/đăng ký KHÁCH HÀNG của Site — gọi Route Handler BFF app/api/customer/* (xác thực với Backend
 * /api/v1/customer/auth/*; token nằm trong cookie HttpOnly, không bao giờ về trình duyệt). Riêng "quên mật khẩu" vẫn là
 * MOCK CONTRACT (Backend chưa có endpoint) — app/api/auth/forgot-password.
 */
const API_ENDPOINTS = {
  login: "/api/customer/auth/login",
  requestRegistrationOtp: "/api/customer/auth/register/request-otp",
  verifyRegistration: "/api/customer/auth/register/verify",
  logout: "/api/customer/auth/logout",
  session: "/api/customer/session",
  forgotPassword: "/api/auth/forgot-password",
} as const;

/** Chờ tối đa bấy nhiêu ms để biết phiên đăng nhập — màn hình khởi tạo của Site không được treo khi máy chủ chậm. */
const SESSION_TIMEOUT_MS = 8_000;

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

/**
 * Đăng ký bước 1: gửi thông tin đăng ký, Backend gửi mã OTP qua Zalo/SMS tới số điện thoại. Chưa có tài khoản nào được
 * tạo cho tới khi mã được xác minh (verifyRegistration).
 */
export async function requestRegistrationOtp(
  payload: RegisterPayload,
): Promise<RegistrationOtpSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.requestRegistrationOtp, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse<RegistrationOtpResponse>(response, "Không gửi được mã xác minh.");
}

/** Đăng ký bước 2: mã đúng thì tài khoản được tạo và đăng nhập luôn (cookie phiên được ghi) — trả về khách vừa tạo. */
export async function verifyRegistration(
  payload: VerifyRegistrationPayload,
): Promise<AuthSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.verifyRegistration, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse<AuthResponse>(response, "Xác minh thất bại.");
}

/** Khách đang đăng nhập (theo cookie) hoặc null khi chưa đăng nhập / phiên hết hạn / không kết nối được. */
export async function fetchSessionUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch(API_ENDPOINTS.session, {
      cache: "no-store",
      signal: AbortSignal.timeout(SESSION_TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }

    // Chưa đăng nhập vẫn là 200 với user = null (xem app/api/customer/session).
    const result = (await response.json()) as { success: boolean; data?: { user: AuthUser | null } };
    return result.success ? (result.data?.user ?? null) : null;
  } catch (error) {
    console.error("Không thể khôi phục phiên đăng nhập:", error);
    return null;
  }
}

export async function logoutSession(): Promise<void> {
  try {
    await fetch(API_ENDPOINTS.logout, { method: "POST" });
  } catch (error) {
    console.error("Không thể đăng xuất ở máy chủ:", error);
  }
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
