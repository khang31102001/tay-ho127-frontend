"use client";

import { useEffect, useRef, useState } from "react";

import type { ManagedMedia, MediaType } from "../types/media.types";
import { uploadLibraryMedia } from "../services/media-library.service";
import {
  MEDIA_BATCH_CONCURRENCY,
  errorMessageOf,
  inferMediaType,
  runWithConcurrency,
  validateUploadFile,
} from "../utils/media-batch";

import { useWarnBeforeUnload } from "./useWarnBeforeUnload";

export type MediaBatchStatus = "pending" | "processing" | "success" | "error";

export type MediaUploadItem = {
  key: string;
  file: File;
  /** Blob URL để xem trước ảnh cục bộ — null với video/PDF. */
  previewUrl: string | null;
  /** Loại dự kiến theo đuôi file, chỉ để hiển thị; loại thật do Backend xác định khi upload. */
  type: MediaType;
  altText: string;
  status: MediaBatchStatus;
  error?: string;
  /** File không qua được kiểm tra phía trình duyệt (sai định dạng/quá dung lượng) — không gửi, không thử lại. */
  isRejected: boolean;
  /** Bản ghi Backend trả về khi upload thành công — nguồn duy nhất của URL. */
  media?: ManagedMedia;
};

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function canUpload(item: MediaUploadItem) {
  return !item.isRejected && (item.status === "pending" || item.status === "error");
}

export function useMediaBulkUpload() {
  const [items, setItems] = useState<MediaUploadItem[]>([]);
  const nextKeyRef = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Thu hồi mọi blob URL khi rời trang.
  useEffect(() => () => itemsRef.current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl)), []);

  const isUploading = items.some((item) => item.status === "processing");
  useWarnBeforeUnload(isUploading);

  function updateItem(key: string, patch: Partial<MediaUploadItem>) {
    setItems((previous) => previous.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  /** Thêm file từ kéo-thả hoặc ô chọn file. Bỏ qua file đã có trong danh sách và chưa tải xong. */
  function addFiles(files: Iterable<File>) {
    const existing = new Set(
      itemsRef.current.filter((item) => item.status !== "success").map((item) => fileIdentity(item.file)),
    );
    const added: MediaUploadItem[] = [];

    for (const file of Array.from(files)) {
      const identity = fileIdentity(file);
      if (existing.has(identity)) continue;
      existing.add(identity);

      const rejection = validateUploadFile(file);
      nextKeyRef.current += 1;
      added.push({
        key: `upload-${nextKeyRef.current}`,
        file,
        previewUrl: !rejection && file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        type: inferMediaType(file.name),
        altText: "",
        status: rejection ? "error" : "pending",
        error: rejection ?? undefined,
        isRejected: rejection !== null,
      });
    }

    if (added.length > 0) {
      setItems((previous) => [...previous, ...added]);
    }
  }

  function removeItem(key: string) {
    const target = itemsRef.current.find((item) => item.key === key);
    if (!target || target.status === "processing") return;
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setItems((previous) => previous.filter((item) => item.key !== key));
  }

  function updateAltText(key: string, altText: string) {
    updateItem(key, { altText });
  }

  /** Áp dụng Alt text chung cho mọi file chưa tải lên (file đã xong giữ nguyên giá trị đã lưu). */
  function applyAltTextToAll(altText: string) {
    setItems((previous) => previous.map((item) => (canUpload(item) ? { ...item, altText } : item)));
  }

  async function uploadItems(targets: MediaUploadItem[]) {
    if (targets.length === 0) return;

    const targetKeys = new Set(targets.map((item) => item.key));
    setItems((previous) =>
      previous.map((item) => (targetKeys.has(item.key) ? { ...item, status: "processing", error: undefined } : item)),
    );

    await runWithConcurrency(targets, MEDIA_BATCH_CONCURRENCY, async (item) => {
      try {
        const media = await uploadLibraryMedia(item.file, item.altText.trim() || undefined);
        updateItem(item.key, { status: "success", media, type: media.type });
      } catch (error) {
        updateItem(item.key, { status: "error", error: errorMessageOf(error, "Tải file thất bại.") });
      }
    });
  }

  function uploadAll() {
    if (isUploading) return Promise.resolve();
    return uploadItems(itemsRef.current.filter(canUpload));
  }

  function retryItem(key: string) {
    const target = itemsRef.current.find((item) => item.key === key);
    return target && canUpload(target) ? uploadItems([target]) : Promise.resolve();
  }

  function retryFailed() {
    if (isUploading) return Promise.resolve();
    return uploadItems(itemsRef.current.filter((item) => item.status === "error" && !item.isRejected));
  }

  /** Dọn các dòng đã xong (thành công hoặc bị từ chối) để tiếp tục thêm đợt mới. */
  function clearFinished() {
    const finished = itemsRef.current.filter((item) => item.status === "success" || item.isRejected);
    finished.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    const finishedKeys = new Set(finished.map((item) => item.key));
    setItems((previous) => previous.filter((item) => !finishedKeys.has(item.key)));
  }

  const summary = {
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    processing: items.filter((item) => item.status === "processing").length,
    success: items.filter((item) => item.status === "success").length,
    failed: items.filter((item) => item.status === "error" && !item.isRejected).length,
    rejected: items.filter((item) => item.isRejected).length,
  };

  return {
    items,
    summary,
    isUploading,
    addFiles,
    removeItem,
    updateAltText,
    applyAltTextToAll,
    uploadAll,
    retryItem,
    retryFailed,
    clearFinished,
  };
}
