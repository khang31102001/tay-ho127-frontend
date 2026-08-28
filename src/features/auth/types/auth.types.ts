export type AuthProvider = "credentials" | "google";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: AuthProvider;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordPayload = {
  phone: string;
};

export type AuthSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type RegisterSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
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
export type RegisterResponse = RegisterSuccessResponse | AuthErrorResponse;
export type ForgotPasswordResponse =
  | ForgotPasswordSuccessResponse
  | AuthErrorResponse;
