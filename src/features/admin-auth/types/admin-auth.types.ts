import type { PermissionKey } from "@/features/roles";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  /** Quyền của admin đang đăng nhập — dùng để gate các tính năng như Import/Export. */
  permissions: PermissionKey[];
};

export type AdminLoginCredentials = {
  email: string;
  password: string;
};

export type AdminAuthSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: AdminUser;
    accessToken: string;
  };
};

export type AdminAuthErrorResponse = {
  success: false;
  message: string;
};

export type AdminAuthResponse = AdminAuthSuccessResponse | AdminAuthErrorResponse;
