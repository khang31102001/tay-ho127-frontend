export type AuthProvider = "credentials" | "google";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type AuthErrorResponse = {
  success: false;
  message: string;
};

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
