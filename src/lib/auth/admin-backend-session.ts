import type { NextRequest, NextResponse } from "next/server";

import { fetchBackend } from "@/lib/http/backend-fetch";

import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_SESSION_COOKIE,
  ADMIN_TOKEN_COOKIE_PATH,
} from "./admin-session-cookie";

/**
 * SERVER-ONLY — chỉ import từ Route Handler dưới app/api/admin/*.
 *
 * BFF (Backend-for-Frontend) cho Admin Portal: trình duyệt chỉ nói chuyện với
 * Next.js; Next.js giữ JWT của Backend ASP.NET Core trong cookie HttpOnly và tự
 * gắn `Authorization: Bearer` khi gọi Backend. Nhờ vậy token không lọt vào JS
 * phía client và Backend không cần bật CORS. Gọi Backend qua
 * src/lib/http/backend-fetch.ts.
 */

/** TokenResponse của POST /api/v1/auth/login|refresh. */
type BackendTokenResponse = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
};

/** MeResponse của GET /api/v1/me. */
export type BackendMeResponse = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  currentBrandId: string | null;
  currentFiscalYearId: string | null;
};

/** Admin đang đăng nhập, dạng trả về cho trình duyệt (không có token). */
export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  /** Mã quyền Backend (vd. "users.view") — dùng để ẩn/hiện thao tác trên UI. */
  permissions: string[];
};

export function toAdminSessionUser(me: BackendMeResponse): AdminSessionUser {
  return { id: me.id, name: me.fullName, email: me.email, roles: me.roles, permissions: me.permissions };
}

export type AdminSessionTokens = {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

function toTokens(response: BackendTokenResponse): AdminSessionTokens {
  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: new Date(response.accessTokenExpiresAtUtc),
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: new Date(response.refreshTokenExpiresAtUtc),
  };
}

export async function loginWithPassword(
  email: string,
  password: string,
  deviceInfo: string | null,
): Promise<{ tokens: AdminSessionTokens } | { error: Response }> {
  const response = await fetchBackend("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, deviceInfo }),
  });
  if (!response.ok) {
    return { error: response };
  }
  return { tokens: toTokens((await response.json()) as BackendTokenResponse) };
}

/**
 * Backend xoay refresh token mỗi lần refresh và coi việc dùng lại token cũ là
 * dấu hiệu bị đánh cắp (thu hồi toàn bộ phiên). Nhiều request song song cùng
 * lúc access token hết hạn sẽ cùng refresh bằng 1 token — nên gộp chúng vào
 * đúng 1 lời gọi, và giữ kết quả thêm một lúc cho request đến trễ vài giây.
 * GIỚI HẠN: gộp trong phạm vi 1 tiến trình Node; chạy nhiều instance cần
 * sticky session hoặc cache dùng chung.
 */
const REFRESH_RESULT_TTL_MS = 30_000;
const refreshesInFlight = new Map<string, Promise<AdminSessionTokens | null>>();

export function refreshSession(refreshToken: string): Promise<AdminSessionTokens | null> {
  const existing = refreshesInFlight.get(refreshToken);
  if (existing) return existing;

  const refresh = (async () => {
    const response = await fetchBackend("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    return response.ok ? toTokens((await response.json()) as BackendTokenResponse) : null;
  })();

  refreshesInFlight.set(refreshToken, refresh);
  setTimeout(() => refreshesInFlight.delete(refreshToken), REFRESH_RESULT_TTL_MS);
  return refresh;
}

export function readSessionTokens(request: NextRequest): { accessToken?: string; refreshToken?: string } {
  return {
    accessToken: request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value,
  };
}

export function writeSessionCookies(response: NextResponse, tokens: AdminSessionTokens): void {
  const secure = process.env.NODE_ENV === "production";
  const tokenCookie = { httpOnly: true, sameSite: "lax" as const, secure, path: ADMIN_TOKEN_COOKIE_PATH };

  response.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, tokens.accessToken, { ...tokenCookie, expires: tokens.accessTokenExpiresAt });
  response.cookies.set(ADMIN_REFRESH_TOKEN_COOKIE, tokens.refreshToken, { ...tokenCookie, expires: tokens.refreshTokenExpiresAt });
  // Cờ phiên cho middleware.ts — không chứa token, sống bằng refresh token.
  response.cookies.set(ADMIN_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: tokens.refreshTokenExpiresAt,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete({ name: ADMIN_ACCESS_TOKEN_COOKIE, path: ADMIN_TOKEN_COOKIE_PATH });
  response.cookies.delete({ name: ADMIN_REFRESH_TOKEN_COOKIE, path: ADMIN_TOKEN_COOKIE_PATH });
  response.cookies.delete({ name: ADMIN_SESSION_COOKIE, path: "/" });
}

/**
 * Gọi Backend thay mặt admin đang đăng nhập: dùng access token trong cookie;
 * nếu thiếu/hết hạn (401) thì refresh 1 lần rồi thử lại. Trả về `tokens` mới
 * (nếu có refresh) để nơi gọi ghi lại cookie, và `unauthenticated` khi phiên
 * không còn cứu được — nơi gọi nên xóa cookie.
 */
export async function fetchBackendAsAdmin(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<{ response: Response; tokens?: AdminSessionTokens; unauthenticated: boolean }> {
  const { accessToken, refreshToken } = readSessionTokens(request);

  if (accessToken) {
    const response = await fetchBackend(path, { ...init, accessToken });
    if (response.status !== 401) {
      return { response, unauthenticated: false };
    }
  }

  const tokens = refreshToken ? await refreshSession(refreshToken) : null;
  if (!tokens) {
    return { response: new Response(null, { status: 401 }), unauthenticated: true };
  }

  const retried = await fetchBackend(path, { ...init, accessToken: tokens.accessToken });
  return { response: retried, tokens, unauthenticated: retried.status === 401 };
}
