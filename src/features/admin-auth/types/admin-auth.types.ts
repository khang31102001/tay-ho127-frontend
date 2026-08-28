export type AdminUser = {
  id: string;
  name: string;
  email: string;
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
