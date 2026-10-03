import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedPage } from "../types/page.types";

/**
 * Admin → Content → Page, gọi Backend /api/v1/content/pages (quyền pages.*).
 *
 * - `slug` là ĐƯỜNG DẪN trang ("/" cho trang chủ, "/thuc-don", "/ve-chung-toi/lich-su"): chữ thường,
 *   mỗi đoạn nối bằng gạch ngang. Để trống khi tạo → Backend sinh từ tên; để trống khi sửa → giữ nguyên.
 *   Trùng đường dẫn → 409. Navigation dùng thẳng giá trị này làm URL.
 * - `publishedAt` do Backend đặt lần đầu page chuyển sang "published", không gửi lên.
 * - Xóa page xóa luôn các section của nó.
 */

/** PageResponse của Backend. */
type PageDto = {
  id: string;
  name: string;
  slug: string;
  status: ManagedPage["status"];
  publishedAt: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type PageUpsertInput = {
  name: string;
  slug: string;
  status: ManagedPage["status"];
};

function toManagedPage(dto: PageDto): ManagedPage {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    status: dto.status,
    publishedAt: dto.publishedAt,
    createdAt: dto.createdAtUtc,
    updatedAt: dto.updatedAtUtc ?? dto.createdAtUtc,
  };
}

function toRequest(payload: PageUpsertInput) {
  return { name: payload.name, slug: payload.slug || null, status: payload.status };
}

export async function listPages(): Promise<ManagedPage[]> {
  const page = await adminApi.get<PaginatedResult<PageDto>>("/content/pages", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items.map(toManagedPage);
}

export async function getPageById(id: string): Promise<ManagedPage> {
  return toManagedPage(await adminApi.get<PageDto>(`/content/pages/${id}`));
}

export async function createPage(payload: PageUpsertInput): Promise<ManagedPage> {
  return toManagedPage(await adminApi.post<PageDto>("/content/pages", toRequest(payload)));
}

export async function updatePage(id: string, payload: PageUpsertInput): Promise<ManagedPage> {
  return toManagedPage(await adminApi.put<PageDto>(`/content/pages/${id}`, toRequest(payload)));
}

export function deletePage(id: string): Promise<void> {
  return adminApi.delete<void>(`/content/pages/${id}`);
}
