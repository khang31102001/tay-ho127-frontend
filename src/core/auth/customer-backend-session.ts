import type { NextRequest, NextResponse } from "next/server";

import { fetchBackend } from "../../lib/http/backend-fetch";

import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_TOKEN_COOKIE_PATH,
} from "../../lib/auth/customer-session-cookie";

export type BackendCustomerMeResponse = {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarMediaId: string | null;
  status: string;
};

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

export function toCustomerTokens(response: {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}): CustomerSessionTokens {
  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: new Date(response.accessTokenExpiresAtUtc),
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: new Date(response.refreshTokenExpiresAtUtc),
  };
}

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
    return response.ok ? toCustomerTokens((await response.json()) as {
      accessToken: string;
      accessTokenExpiresAtUtc: string;
      refreshToken: string;
      refreshTokenExpiresAtUtc: string;
    }) : null;
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
    if (!options.requireSession) {
      return { response: await fetchBackend(path, init), unauthenticated: true };
    }
    return { response: new Response(null, { status: 401 }), unauthenticated: true };
  }

  const retried = await fetchBackend(path, { ...init, accessToken: tokens.accessToken });
  return { response: retried, tokens, unauthenticated: retried.status === 401 && options.requireSession };
}
