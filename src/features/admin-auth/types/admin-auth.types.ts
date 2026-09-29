import type { AdminSessionUser } from "@/lib/auth/admin-backend-session";

/** Admin đang đăng nhập — hồ sơ + role + mã quyền Backend (vd. "users.view"), không chứa token. */
export type AdminUser = AdminSessionUser;

export type AdminLoginCredentials = {
  email: string;
  password: string;
};

export type AdminAuthSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: AdminUser;
  };
};

export type AdminAuthErrorResponse = {
  success: false;
  message: string;
};

export type AdminAuthResponse = AdminAuthSuccessResponse | AdminAuthErrorResponse;
