import { fetchBackend } from "@/lib/http/backend-fetch";

import type { RedirectType } from "../types/redirect.types";

/**
 * Redirect ĐANG BẬT cho Customer Site — Backend GET /api/v1/seo/public/redirects (không cần đăng nhập).
 * Dùng bởi middleware.ts (Edge Runtime): chỉ dùng fetch + Map, không import thứ gì của Node hay UI Admin.
 *
 * Middleware chạy trên MỌI request nên danh sách được giữ trong bộ nhớ và làm mới sau 60 giây (Admin sửa →
 * Site áp dụng trong tối đa 60 giây). Backend lỗi/không kết nối được → giữ danh sách cũ (hoặc rỗng nếu chưa
 * có) và thử lại sau 10 giây: redirect hỏng KHÔNG BAO GIỜ chặn request (fail-open).
 */
export type PublicRedirect = {
  sourcePath: string;
  destinationUrl: string;
  redirectType: RedirectType;
};

const REFRESH_INTERVAL_MS = 60_000;
const RETRY_INTERVAL_MS = 10_000;
const REQUEST_TIMEOUT_MS = 1_500;

let redirectsBySource = new Map<string, PublicRedirect>();
let nextRefreshAt = 0;
let refreshInFlight: Promise<void> | null = null;

async function refreshRedirects(): Promise<void> {
  try {
    const response = await fetchBackend("/seo/public/redirects", { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

    if (!response.ok) {
      throw new Error(`Public redirects: HTTP ${response.status}`);
    }

    const redirects = (await response.json()) as PublicRedirect[];
    redirectsBySource = new Map(redirects.map((redirect) => [redirect.sourcePath, redirect]));
    nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;
  } catch (error) {
    console.error("Không tải được redirect từ Backend — giữ danh sách cũ:", error);
    nextRefreshAt = Date.now() + RETRY_INTERVAL_MS;
  }
}

/** Redirect đang bật khớp CHÍNH XÁC pathname (bỏ "/" cuối), hoặc null. */
export async function findActiveRedirect(pathname: string): Promise<PublicRedirect | null> {
  if (Date.now() >= nextRefreshAt) {
    // Gộp các request đồng thời vào 1 lần gọi Backend.
    refreshInFlight ??= refreshRedirects().finally(() => {
      refreshInFlight = null;
    });
    await refreshInFlight;
  }

  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return redirectsBySource.get(normalized) ?? null;
}
