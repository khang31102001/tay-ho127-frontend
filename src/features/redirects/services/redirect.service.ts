import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import { isApiError } from "@/lib/http/api-error";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedRedirect, RedirectFormValue } from "../types/redirect.types";

/**
 * Admin → SEO → Chuyển hướng, gọi Backend /api/v1/seo/redirects (quyền redirects.*).
 * Site áp dụng redirect đang BẬT qua redirect-public.service.ts (middleware), không qua file này.
 *
 * - `sourcePath` được Backend chuẩn hóa (thêm "/" đầu, bỏ "/" cuối) và phải duy nhất (409 nếu trùng); không được là
 *   "/", có query/fragment, hay nằm dưới /admin, /api, /_next. Khớp CHÍNH XÁC, không wildcard/regex.
 * - `destinationUrl` là đường dẫn trong site hoặc URL http(s); Backend trả 400 nếu chuyển về chính nó hoặc tạo vòng lặp.
 */

/** RedirectResponse của Backend — khớp ManagedRedirect 1:1. */
type RedirectDto = ManagedRedirect;

/** Cùng quy tắc chuẩn hóa của Backend, để so khớp trùng source ngay khi gõ. */
function normalizeSourcePath(path: string): string {
  const trimmed = path.trim();
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

export async function listRedirects(): Promise<ManagedRedirect[]> {
  const page = await adminApi.get<PaginatedResult<RedirectDto>>("/seo/redirects", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items;
}

/** null khi không tồn tại (Backend 404). */
export async function getRedirectById(id: string): Promise<ManagedRedirect | null> {
  try {
    return await adminApi.get<RedirectDto>(`/seo/redirects/${id}`);
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

export async function isSourcePathTaken(sourcePath: string, excludeId?: string): Promise<boolean> {
  const normalized = normalizeSourcePath(sourcePath);
  const page = await adminApi.get<PaginatedResult<RedirectDto>>("/seo/redirects", {
    params: { search: normalized, pageSize: 20 },
  });
  return page.items.some((redirect) => redirect.sourcePath === normalized && redirect.id !== excludeId);
}

export async function createRedirect(payload: RedirectFormValue): Promise<ManagedRedirect> {
  return adminApi.post<RedirectDto>("/seo/redirects", payload);
}

export async function updateRedirect(id: string, payload: RedirectFormValue): Promise<ManagedRedirect> {
  return adminApi.put<RedirectDto>(`/seo/redirects/${id}`, payload);
}

export async function deleteRedirect(id: string): Promise<void> {
  await adminApi.delete(`/seo/redirects/${id}`);
}
