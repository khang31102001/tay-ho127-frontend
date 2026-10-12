import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/core/api/admin-api";
import { ApiError, resolveErrorKind } from "@/core/api/api-error";
import type { PaginatedResult } from "@/core/api/api-types";

import type { ManagedMedia, MediaType } from "../types/media.types";

/**
 * Admin → Thư viện Media, gọi Backend /api/v1/media (quyền media.*).
 * Media tạo bằng URL (createLibraryMedia) hoặc upload file (uploadLibraryMedia). Xóa là xóa mềm: media
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

/** Giới hạn khớp Backend (MediaStorage:MaxFileBytes mặc định 10MB) — chặn sớm để khỏi upload file chắc chắn bị từ chối. */
export const MEDIA_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Đuôi file Backend chấp nhận (MediaFileRules) — dùng cho thuộc tính `accept` của ô chọn file. */
export const MEDIA_UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.pdf";

const UPLOAD_TIMEOUT_MS = 60_000;

/**
 * Upload file thật lên Backend (qua BFF app/api/admin/media/upload). Backend tự xác định loại, dung
 * lượng và URL. Không dùng adminApi vì nó luôn gửi JSON; ở đây gửi FormData để trình duyệt tự đặt boundary.
 */
export async function uploadLibraryMedia(file: File, altText?: string): Promise<ManagedMedia> {
  const formData = new FormData();
  formData.append("file", file);
  if (altText) {
    formData.append("altText", altText);
  }

  let response: Response;
  try {
    response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    throw new ApiError(isTimeout ? "Tải file quá thời gian chờ." : "Không thể kết nối tới máy chủ.", {
      status: null,
      kind: isTimeout ? "timeout" : "network",
      details: error,
    });
  }

  const payload: unknown = response.headers.get("content-type")?.includes("json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.assign("/admin/login");
    }
    throw new ApiError(extractProblemMessage(payload) ?? `Tải file thất bại (${response.status}).`, {
      status: response.status,
      kind: resolveErrorKind(response.status),
      details: payload,
    });
  }

  return toManagedMedia(payload as MediaDto);
}

/** ProblemDetails của Backend: ưu tiên message của field lỗi đầu tiên, rồi detail/title. */
function extractProblemMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const { detail, title, errors } = payload as { detail?: unknown; title?: unknown; errors?: unknown };

  const firstFieldError =
    errors && typeof errors === "object"
      ? Object.values(errors as Record<string, unknown>)
          .flatMap((value) => (Array.isArray(value) ? value : []))
          .find((value): value is string => typeof value === "string" && value.trim() !== "")
      : undefined;

  const message = [firstFieldError, detail, title].find((value) => typeof value === "string" && value.trim() !== "");
  return typeof message === "string" ? message : null;
}
