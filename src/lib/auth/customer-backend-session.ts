import type { NextRequest, NextResponse } from "next/server";

import { fetchBackend } from "@/lib/http/backend-fetch";

import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_TOKEN_COOKIE_PATH,
} from "./customer-session-cookie";

/**
 * SERVER-ONLY — chỉ import từ Route Handler dưới app/api/*.
 *
 * BFF cho KHÁCH HÀNG của Site, cùng cách làm với admin-backend-session.ts: trình duyệt chỉ nói chuyện với Next.js; Next.js
 * giữ JWT khách của Backend trong cookie HttpOnly và gắn `Authorization: Bearer` khi gọi Backend. Token không lọt vào JS
 * phía client và Backend không cần bật CORS.
 */

/** CustomerTokenResponse của POST /api/v1/customer/auth/login|register|refresh. */
type BackendCustomerTokenResponse = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
};

/** CustomerMeResponse của GET /api/v1/customers/me. */
export type BackendCustomerMeResponse = {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarMediaId: string | null;
  status: string;
};

/** Khách đang đăng nhập, dạng trả về cho trình duyệt (không có token). `id` là id khách hàng ở Backend. */
export type CustomerSessionUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: "credentials" | "google";
  customerId: string;
};

export function toCustomerSessionUser(me: BackendCustomerMeResponse): CustomerSessionUser {
  return {
    id: me.id,
    name: me.fullName,
    email: me.email ?? undefined,
    phone: me.phone ?? undefined,
    provider: "credentials",
    customerId: me.id,
  };
}

export type CustomerSessionTokens = {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export function toCustomerTokens(response: BackendCustomerTokenResponse): CustomerSessionTokens {
  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: new Date(response.accessTokenExpiresAtUtc),
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: new Date(response.refreshTokenExpiresAtUtc),
  };
}

/**
 * Backend xoay refresh token mỗi lần refresh và coi việc dùng lại token cũ là dấu hiệu bị đánh cắp. Nhiều request song song
 * cùng lúc access token hết hạn sẽ cùng refresh bằng 1 token — nên gộp vào đúng 1 lời gọi và giữ kết quả thêm một lúc cho
 * request đến trễ vài giây. GIỚI HẠN: gộp trong phạm vi 1 tiến trình Node.
 */
const REFRESH_RESULT_TTL_MS = 30_000;
const refreshesInFlight = new Map<string, Promise<CustomerSessionTokens | null>>();

export function refreshCustomerSession(refreshToken: string): Promise<CustomerSessionTokens | null> {
  const existing = refreshesInFlight.get(refreshToken);
  if (existing) return existing;

  const refresh = (async () => {
    const response = await fetchBackend("/customer/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    return response.ok ? toCustomerTokens((await response.json()) as BackendCustomerTokenResponse) : null;
  })();

  refreshesInFlight.set(refreshToken, refresh);
  setTimeout(() => refreshesInFlight.delete(refreshToken), REFRESH_RESULT_TTL_MS);
  return refresh;
}

export function readCustomerTokens(request: NextRequest): { accessToken?: string; refreshToken?: string } {
  return {
    accessToken: request.cookies.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: request.cookies.get(CUSTOMER_REFRESH_TOKEN_COOKIE)?.value,
  };
}

export function writeCustomerCookies(response: NextResponse, tokens: CustomerSessionTokens): void {
  const secure = process.env.NODE_ENV === "production";
  const tokenCookie = { httpOnly: true, sameSite: "lax" as const, secure, path: CUSTOMER_TOKEN_COOKIE_PATH };

  response.cookies.set(CUSTOMER_ACCESS_TOKEN_COOKIE, tokens.accessToken, { ...tokenCookie, expires: tokens.accessTokenExpiresAt });
  response.cookies.set(CUSTOMER_REFRESH_TOKEN_COOKIE, tokens.refreshToken, { ...tokenCookie, expires: tokens.refreshTokenExpiresAt });
}

export function clearCustomerCookies(response: NextResponse): void {
  response.cookies.delete({ name: CUSTOMER_ACCESS_TOKEN_COOKIE, path: CUSTOMER_TOKEN_COOKIE_PATH });
  response.cookies.delete({ name: CUSTOMER_REFRESH_TOKEN_COOKIE, path: CUSTOMER_TOKEN_COOKIE_PATH });
}

/**
 * Gọi Backend thay mặt khách đang đăng nhập: dùng access token trong cookie; nếu thiếu/hết hạn (401) thì refresh 1 lần rồi
 * thử lại. Trả về `tokens` mới (nếu có refresh) để nơi gọi ghi lại cookie, và `unauthenticated` khi phiên không còn cứu
 * được — nơi gọi nên xóa cookie.
 *
 * Với endpoint công khai chấp nhận khách vãng lai (vd. đặt hàng), `requireSession: false` cho phép đi tiếp KHÔNG token khi
 * khách chưa đăng nhập — thay vì trả 401.
 */
export async function fetchBackendAsCustomer(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
  options: { requireSession: boolean } = { requireSession: true },
): Promise<{ response: Response; tokens?: CustomerSessionTokens; unauthenticated: boolean }> {
  const { accessToken, refreshToken } = readCustomerTokens(request);

  if (!accessToken && !refreshToken && !options.requireSession) {
    return { response: await fetchBackend(path, init), unauthenticated: false };
  }

  if (accessToken) {
    const response = await fetchBackend(path, { ...init, accessToken });
    if (response.status !== 401) {
      return { response, unauthenticated: false };
    }
  }

  const tokens = refreshToken ? await refreshCustomerSession(refreshToken) : null;
  if (!tokens) {
    // Phiên hỏng: với endpoint cho phép khách vãng lai, vẫn gọi tiếp không token (và dọn cookie hỏng).
    if (!options.requireSession) {
      return { response: await fetchBackend(path, init), unauthenticated: true };
    }
    return { response: new Response(null, { status: 401 }), unauthenticated: true };
  }

  const retried = await fetchBackend(path, { ...init, accessToken: tokens.accessToken });
  return { response: retried, tokens, unauthenticated: retried.status === 401 && options.requireSession };
}
