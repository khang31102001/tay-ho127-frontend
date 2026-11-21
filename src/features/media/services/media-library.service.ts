import type { EntityStatus } from "@/shared/admin/templates/StatusBadge";
import { adminApi } from "@/core/api/admin-api";
import { ApiError, resolveErrorKind } from "@/core/api/api-error";
import type { PagedQuery, PaginatedResult } from "@/core/api/api-types";

import type { MediaCategoryCode } from "../types/media-category.types";
import type { ManagedMedia, MediaStorage, MediaStorageOption, MediaType, MediaUploadStorage } from "../types/media.types";

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
  storage: string;
  categoryCode?: string | null;
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
    storage: dto.storage.toLowerCase() as MediaStorage,
    categoryCode: dto.categoryCode ?? undefined,
  };
}

export type MediaUpsertInput = Pick<ManagedMedia, "fileName" | "url" | "type" | "altText" | "size" | "categoryCode">;

/** Lọc danh sách thư viện theo trạng thái — Backend nhận "Active" | "Inactive". */
export type LibraryMediaStatusFilter = EntityStatus | "all";

/** 1 trang thư viện media (mới tải lên trước) — Backend tìm theo tên file, lọc theo trạng thái. */
export async function listLibraryMediaPage(
  query: PagedQuery & { status?: LibraryMediaStatusFilter; category?: MediaCategoryCode | "all" },
  signal?: AbortSignal,
): Promise<PaginatedResult<ManagedMedia>> {
  const { status, category, ...paging } = query;
  const page = await adminApi.get<PaginatedResult<MediaDto>>("/media", {
    params: {
      sortDirection: "desc",
      ...paging,
      ...(status && status !== "all" ? { status: status === "active" ? "Active" : "Inactive" } : {}),
      ...(category && category !== "all" ? { category } : {}),
    },
    signal,
  });
  return { ...page, items: page.items.map(toManagedMedia) };
}

export async function getLibraryMediaById(id: string): Promise<ManagedMedia> {
  return toManagedMedia(await adminApi.get<MediaDto>(`/media/${id}`));
}

export async function createLibraryMedia(input: MediaUpsertInput): Promise<ManagedMedia> {
  const { fileName, url, type, altText, size, categoryCode } = input;
  return toManagedMedia(
    await adminApi.post<MediaDto>("/media", { fileName, url, type, altText: altText || null, size, categoryCode: categoryCode || null }),
  );
}

/** Backend không cho sửa dung lượng sau khi tạo. */
export async function updateLibraryMedia(id: string, input: MediaUpsertInput): Promise<ManagedMedia> {
  const { fileName, url, type, altText, categoryCode } = input;
  return toManagedMedia(
    await adminApi.put<MediaDto>(`/media/${id}`, { fileName, url, type, altText: altText || null, categoryCode: categoryCode || null }),
  );
}

export function deleteLibraryMedia(id: string): Promise<void> {
  return adminApi.delete<void>(`/media/${id}`);
}

type MediaStorageOptionDto = { code: string; isAvailable: boolean; isDefault: boolean };

/** Nơi lưu chọn được khi upload (Server / Vietnix / Cloudinary) — nơi chưa có khóa trên server thì isAvailable = false. */
export async function getMediaStorageOptions(): Promise<MediaStorageOption[]> {
  const options = await adminApi.get<MediaStorageOptionDto[]>("/media/storage-options");
  return options.map((option) => ({ ...option, code: option.code.toLowerCase() as MediaUploadStorage }));
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
export async function uploadLibraryMedia(
  file: File,
  storage: MediaUploadStorage,
  altText?: string,
  category?: MediaCategoryCode,
): Promise<ManagedMedia> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("storage", storage);
  if (category) {
    formData.append("category", category);
  }
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

/** Một nơi đang dùng media (GET /media/{id}/usages, kết quả "inUse" khi xóa vĩnh viễn). */
export type MediaUsage = {
  module: string;
  entityId: string;
  entityName: string;
  field: string;
};

export type MediaPurgeStatus = "deleted" | "inUse" | "notFound" | "failed";

export type MediaPurgeResult = {
  id: string;
  status: MediaPurgeStatus;
  fileName: string | null;
  message: string | null;
  usages: MediaUsage[];
};

/** Tối đa số media mỗi lần xóa vĩnh viễn — khớp PurgeMediaRequestValidator ở Backend. */
export const MEDIA_PURGE_MAX_BATCH = 100;

/** Những nơi còn dùng media (sản phẩm, bài viết, banner, section, thương hiệu, SEO, ...). */
export function getMediaUsages(id: string): Promise<MediaUsage[]> {
  return adminApi.get<MediaUsage[]>(`/media/${id}/usages`);
}

/**
 * Xóa VĨNH VIỄN (file trên nơi lưu + bản ghi) — quyền media.purge, không hoàn tác được. Media đang được dùng
 * bị Backend bỏ qua (status "inUse" kèm nơi dùng); kết quả trả theo từng id.
 */
export async function purgeLibraryMedia(ids: string[]): Promise<{ deletedCount: number; results: MediaPurgeResult[] }> {
  return adminApi.post<{ deletedCount: number; results: MediaPurgeResult[] }>("/media/purge", { ids });
}
