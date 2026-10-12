/**
 * SERVER-ONLY — gọi thẳng Backend ASP.NET Core từ server Next.js (Route
 * Handler, Server Component). Trình duyệt không bao giờ gọi Backend trực tiếp:
 * Admin đi qua BFF (app/api/admin/*), dữ liệu công khai đi qua Route Handler
 * công khai (vd. app/api/media/public).
 *
 * BACKEND_API_URL: origin của Backend (vd. http://localhost:5140) — biến
 * server-only, KHÔNG dùng NEXT_PUBLIC_*.
 */
export function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error("BACKEND_API_URL chưa được cấu hình (xem .env.example).");
  }
  return url.replace(/\/+$/, "");
}

type BackendRequestInit = RequestInit & {
  accessToken?: string;
  /** Next.js data cache — mặc định không cache (dữ liệu Admin phải luôn mới). */
  next?: { revalidate?: number | false };
};

/** Gọi Backend ở path /api/v1<path>. Trả nguyên Response để nơi gọi quyết định. */
export function fetchBackend(path: string, init: BackendRequestInit = {}): Promise<Response> {
  const { accessToken, headers, next, ...rest } = init;
  return fetch(`${getBackendApiUrl()}/api/v1${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    ...(next ? { next } : { cache: "no-store" }),
  });
}
