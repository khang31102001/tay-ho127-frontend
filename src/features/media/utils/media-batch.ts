import { formatFileSize } from "@/core/utils/format-file-size";

import type { MediaType } from "../types/media.types";
import { MEDIA_UPLOAD_ACCEPT, MEDIA_UPLOAD_MAX_BYTES } from "../services/media-library.service";

/**
 * Tiện ích cho màn hình Thêm media hàng loạt: đọc thông tin có thể suy ra trực tiếp từ file/URL
 * và kiểm tra dữ liệu trước khi gửi. Giới hạn độ dài khớp CreateMediaRequestValidator của Backend.
 */

export const MEDIA_FILE_NAME_MAX_LENGTH = 256;
export const MEDIA_URL_MAX_LENGTH = 2048;
export const MEDIA_ALT_TEXT_MAX_LENGTH = 512;

/** Số request chạy song song khi xử lý hàng loạt — đủ nhanh mà không dồn tải lên BFF/Backend. */
export const MEDIA_BATCH_CONCURRENCY = 3;

const ACCEPTED_EXTENSIONS = MEDIA_UPLOAD_ACCEPT.split(",").map((extension) => extension.trim().toLowerCase());

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogv"]);
const DOCUMENT_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"]);

function extensionOf(name: string): string {
  const cleanName = name.split(/[?#]/)[0] ?? "";
  const dotIndex = cleanName.lastIndexOf(".");
  return dotIndex >= 0 ? cleanName.slice(dotIndex).toLowerCase() : "";
}

/** Loại media theo đuôi file; không rõ đuôi thì mặc định "image" (giống giá trị mặc định của form cũ). */
export function inferMediaType(name: string): MediaType {
  const extension = extensionOf(name);
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (DOCUMENT_EXTENSIONS.has(extension)) return "document";
  return "image";
}

/** Lỗi của file trước khi upload (sai định dạng / quá dung lượng), hoặc null nếu hợp lệ. */
export function validateUploadFile(file: File): string | null {
  if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file.name))) {
    return `Định dạng không được hỗ trợ (chỉ nhận ${ACCEPTED_EXTENSIONS.join(", ")}).`;
  }
  if (file.size > MEDIA_UPLOAD_MAX_BYTES) {
    return `File ${formatFileSize(file.size)} vượt quá giới hạn ${MEDIA_UPLOAD_MAX_BYTES / (1024 * 1024)}MB.`;
  }
  return null;
}

/** Tên file lấy từ đoạn cuối của đường dẫn URL (đã giải mã), rỗng nếu URL không có tên file. */
export function fileNameFromUrl(url: string): string {
  const trimmed = url.trim();
  // Chỉ xét phần path: URL tuyệt đối "https://cdn.x.com/" không được lấy nhầm tên miền làm tên file.
  const path = /^https?:\/\//i.test(trimmed) ? trimmed.replace(/^https?:\/\/[^/?#]*/i, "") : trimmed;
  const lastSegment = path.split(/[?#]/)[0]?.split("/").filter(Boolean).pop() ?? "";
  if (!lastSegment || !lastSegment.includes(".")) return "";

  try {
    return decodeURIComponent(lastSegment);
  } catch {
    return lastSegment;
  }
}

/** Cùng quy ước với ô URL của form cũ: "https://..." hoặc đường dẫn nội bộ "/images/ten-file.jpg". */
export function isSupportedMediaUrl(url: string): boolean {
  return /^https?:\/\/\S+$/i.test(url) || /^\/\S+$/.test(url);
}

/** Tách danh sách URL dán vào (mỗi dòng một URL, chấp nhận cả dấu phẩy/khoảng trắng). */
export function parseUrlList(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

/** Chạy `worker` cho từng phần tử, tối đa `concurrency` việc cùng lúc. Lỗi của từng việc do worker tự xử lý. */
export async function runWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      await worker(item);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runNext));
}

export function errorMessageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim() !== "" ? error.message : fallback;
}
