"use client";

import { useEffect, useRef, useState } from "react";

import {
  getMediaStorageOptions,
  listLibraryMediaPage,
  uploadLibraryMedia,
} from "../services/media-library.service";
import type { MediaCategoryCode } from "../types/media-category.types";
import type { ManagedMedia, MediaType, MediaUploadStorage } from "../types/media.types";
import {
  MEDIA_BATCH_CONCURRENCY,
  errorMessageOf,
  inferMediaType,
  runWithConcurrency,
  validateUploadFile,
} from "../utils/media-batch";

/** File chờ tải lên trong popup chọn media — CHƯA gửi lên server cho tới khi bấm Lưu. */
export type PendingUpload = {
  /** Khóa chọn trong popup, dạng "upload:<n>" để không trùng với id media thật. */
  key: string;
  file: File;
  previewUrl: string | null;
  type: MediaType;
  /** Lỗi kiểm tra phía trình duyệt (định dạng/dung lượng/loại) — file này không bao giờ được gửi. */
  rejection: string | null;
  /** Lỗi khi tải lên (bấm Lưu lần nữa để thử lại). */
  error: string | null;
  isUploading: boolean;
  /** Media đã có sau khi Lưu (tải mới hoặc dùng lại bản trùng trong thư viện) — Lưu lại không tải lần 2. */
  media: ManagedMedia | null;
  isReused: boolean;
};

export const PENDING_UPLOAD_PREFIX = "upload:";

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

/** Nơi lưu mặc định của server; lỗi tải danh sách thì để Backend tự chọn mặc định ("local"). */
async function resolveDefaultStorage(): Promise<MediaUploadStorage> {
  const options = await getMediaStorageOptions();
  const available = options.filter((option) => option.isAvailable);
  return (available.find((option) => option.isDefault) ?? available[0])?.code ?? "local";
}

/** Ảnh cùng tên + cùng dung lượng đã có trong thư viện (đang hoạt động) → dùng lại, không tạo bản ghi trùng. */
async function findDuplicateInLibrary(file: File): Promise<ManagedMedia | null> {
  const page = await listLibraryMediaPage({ search: file.name, pageSize: 20 });
  return (
    page.items.find(
      (media) =>
        media.fileName === file.name && media.size === file.size && media.status === "active" && media.type === inferMediaType(file.name),
    ) ?? null
  );
}

/**
 * State của tab "Upload" trong MediaPickerDialog: giữ file ở trình duyệt (xem trước bằng blob URL),
 * chỉ tải lên Media khi gọi `uploadSelected` (bấm Lưu). Đóng popup = bỏ hết, không tạo media nào.
 */
export function useMediaPickerUpload(allowedTypes: MediaType[] | null, category?: MediaCategoryCode) {
  const [items, setItems] = useState<PendingUpload[]>([]);
  const nextKeyRef = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(
    () => () => itemsRef.current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl)),
    [],
  );

  function updateItem(key: string, patch: Partial<PendingUpload>) {
    setItems((previous) => previous.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  /** Thêm file (chọn file / kéo thả). Trả về khóa các file hợp lệ vừa thêm để popup chọn sẵn. */
  function addFiles(files: Iterable<File>): string[] {
    const existing = new Set(itemsRef.current.map((item) => fileIdentity(item.file)));
    const added: PendingUpload[] = [];

    for (const file of Array.from(files)) {
      const identity = fileIdentity(file);
      if (existing.has(identity)) continue;
      existing.add(identity);

      const type = inferMediaType(file.name);
      const rejection =
        validateUploadFile(file) ??
        (allowedTypes && !allowedTypes.includes(type) ? "Chỉ được chọn file ảnh (.jpg, .jpeg, .png, .gif, .webp)." : null);

      nextKeyRef.current += 1;
      added.push({
        key: `${PENDING_UPLOAD_PREFIX}${nextKeyRef.current}`,
        file,
        previewUrl: !rejection && file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        type,
        rejection,
        error: null,
        isUploading: false,
        media: null,
        isReused: false,
      });
    }

    setItems((previous) => [...previous, ...added]);
    return added.filter((item) => !item.rejection).map((item) => item.key);
  }

  function removeItem(key: string) {
    const item = itemsRef.current.find((candidate) => candidate.key === key);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setItems((previous) => previous.filter((candidate) => candidate.key !== key));
  }

  /**
   * Tải lên các file đang được chọn (bỏ qua file đã tải xong). Trả về map khóa → media; file lỗi không có
   * trong map và mang `error` để hiển thị.
   */
  async function uploadSelected(keys: string[]): Promise<Map<string, ManagedMedia>> {
    const done = new Map<string, ManagedMedia>();
    const toUpload: PendingUpload[] = [];

    for (const key of keys) {
      const item = itemsRef.current.find((candidate) => candidate.key === key);
      if (!item || item.rejection) continue;
      if (item.media) done.set(key, item.media);
      else toUpload.push(item);
    }

    if (toUpload.length === 0) return done;

    let storage: MediaUploadStorage;
    try {
      storage = await resolveDefaultStorage();
    } catch (error) {
      const message = errorMessageOf(error, "Không lấy được nơi lưu media.");
      toUpload.forEach((item) => updateItem(item.key, { error: message }));
      return done;
    }

    await runWithConcurrency(toUpload, MEDIA_BATCH_CONCURRENCY, async (item) => {
      updateItem(item.key, { isUploading: true, error: null });
      try {
        const duplicate = await findDuplicateInLibrary(item.file);
        const media = duplicate ?? (await uploadLibraryMedia(item.file, storage, undefined, category));
        done.set(item.key, media);
        updateItem(item.key, { isUploading: false, media, isReused: duplicate !== null });
      } catch (error) {
        updateItem(item.key, { isUploading: false, error: errorMessageOf(error, "Tải file thất bại.") });
      }
    });

    return done;
  }

  return { items, addFiles, removeItem, uploadSelected };
}
