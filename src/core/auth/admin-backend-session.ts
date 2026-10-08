import type { NextRequest, NextResponse } from "next/server";

import { fetchBackend } from "../../lib/http/backend-fetch";

import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_SESSION_COOKIE,
  ADMIN_TOKEN_COOKIE_PATH,
} from "../../lib/auth/admin-session-cookie";

export type BackendMeResponse = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  currentBrandId: string | null;
  currentFiscalYearId: string | null;
};

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
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

function toTokens(response: {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}): AdminSessionTokens {
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
  return { tokens: toTokens((await response.json()) as {
    accessToken: string;
    accessTokenExpiresAtUtc: string;
    refreshToken: string;
    refreshTokenExpiresAtUtc: string;
  }) };
}

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
    return response.ok ? toTokens((await response.json()) as {
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
