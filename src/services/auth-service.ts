import type {
  AuthResponse,
  AuthSuccessResponse,
  LoginCredentials,
} from "@/types/auth";

const API_ENDPOINTS = {
  login: "/api/auth/login",
  google: "/api/auth/google",
} as const;

async function readAuthResponse(response: Response): Promise<AuthSuccessResponse> {
  const result = (await response.json()) as AuthResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Đăng nhập thất bại.");
  }

  return result;
}

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

  return readAuthResponse(response);
}

export async function loginWithGoogle(): Promise<AuthSuccessResponse> {
  const response = await fetch(API_ENDPOINTS.google, {
    method: "POST",
  });

  return readAuthResponse(response);
}
