export type AuthProvider = "credentials" | "google";

/**
 * Khách hàng đang đăng nhập trên Site — khớp CustomerSessionUser của BFF (src/lib/auth/customer-backend-session.ts), tức
 * hồ sơ khách ở Backend. Token KHÔNG nằm ở đây: nó ở cookie HttpOnly, trình duyệt không bao giờ thấy.
 */
export type AuthUser = {
  /** Id khách hàng ở Backend. */
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: AuthProvider;
  /** Cùng giá trị với `id` — id khách hàng ở Backend, dùng để biết "đơn này của tôi" (Backend tự liên kết đơn qua cookie). */
  customerId?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/** Bước 2 của đăng ký: mã OTP khách nhận được qua Zalo/SMS. */
export type VerifyRegistrationPayload = {
  phone: string;
  code: string;
};

export type ForgotPasswordPayload = {
  phone: string;
};

export type AuthSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
  };
};

/** Đã gửi OTP: mã hết hạn lúc `expiresAt`, được gửi lại từ `resendAvailableAt` (ISO UTC). */
export type RegistrationOtpSuccessResponse = {
  success: true;
  message: string;
  data: {
    expiresAt: string;
    resendAvailableAt: string;
  };
};

export type ForgotPasswordSuccessResponse = {
  success: true;
  message: string;
};

export type AuthErrorResponse = {
  success: false;
  message: string;
};

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
export type RegistrationOtpResponse = RegistrationOtpSuccessResponse | AuthErrorResponse;
export type ForgotPasswordResponse =
  | ForgotPasswordSuccessResponse
  | AuthErrorResponse;
