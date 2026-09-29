import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedMedia, MediaType } from "../types/media.types";

/**
 * Admin → Thư viện Media, gọi Backend /api/v1/media (quyền media.*).
 * Backend chỉ lưu metadata + URL (chưa có upload file). Xóa là xóa mềm: media
 * chuyển "Ngừng hoạt động" (vẫn tra được theo id) và không hiện ở Site nữa.
 */

/** MediaResponse của Backend — type/status là tên enum viết hoa ("Image", "Active"). */
type MediaDto = {
  id: string;
  fileName: string;
  url: string;
  type: string;
  altText: string | null;
  size: number;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

function toManagedMedia(dto: MediaDto): ManagedMedia {
  return {
    id: dto.id,
    fileName: dto.fileName,
    url: dto.url,
    type: dto.type.toLowerCase() as MediaType,
    altText: dto.altText ?? undefined,
    size: dto.size,
    status: dto.status.toLowerCase() as EntityStatus,
  };
}

export type MediaUpsertInput = Pick<ManagedMedia, "fileName" | "url" | "type" | "altText" | "size">;

export async function listLibraryMedia(): Promise<ManagedMedia[]> {
  const page = await adminApi.get<PaginatedResult<MediaDto>>("/media", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE, sortDirection: "desc" },
  });
  return page.items.map(toManagedMedia);
}

export async function getLibraryMediaById(id: string): Promise<ManagedMedia> {
  return toManagedMedia(await adminApi.get<MediaDto>(`/media/${id}`));
}

export async function createLibraryMedia(input: MediaUpsertInput): Promise<ManagedMedia> {
  const { fileName, url, type, altText, size } = input;
  return toManagedMedia(await adminApi.post<MediaDto>("/media", { fileName, url, type, altText: altText || null, size }));
}

/** Backend không cho sửa dung lượng sau khi tạo. */
export async function updateLibraryMedia(id: string, input: MediaUpsertInput): Promise<ManagedMedia> {
  const { fileName, url, type, altText } = input;
  return toManagedMedia(await adminApi.put<MediaDto>(`/media/${id}`, { fileName, url, type, altText: altText || null }));
}

export function deleteLibraryMedia(id: string): Promise<void> {
  return adminApi.delete<void>(`/media/${id}`);
}
