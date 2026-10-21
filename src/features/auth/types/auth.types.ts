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

/**
 * Bước 2 của đăng ký (tạo tài khoản): Backend không giữ thông tin đăng ký giữa hai bước nên gửi lại đủ dữ liệu form, kèm
 * `challengeId` (bước 1 trả về) và `code` (mã OTP khách nhận qua Zalo/SMS). Bỏ cả hai khi Backend không bật xác minh.
 */
export type VerifyRegistrationPayload = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  challengeId?: string;
  code?: string;
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

/**
 * Kết quả bước 1 của đăng ký. Đã gửi OTP: `challengeId` phải gửi lại ở bước 2, mã hết hạn lúc `expiresAt`, được gửi lại
 * từ `resendAvailableAt` (ISO UTC). `verificationRequired: false` = Backend không bật xác minh số điện thoại, bỏ qua bước
 * nhập mã.
 */
export type RegistrationOtpSuccessResponse = {
  success: true;
  message: string;
  data:
    | {
        verificationRequired: true;
        challengeId: string;
        expiresAt: string;
        resendAvailableAt: string;
      }
    | { verificationRequired: false };
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
