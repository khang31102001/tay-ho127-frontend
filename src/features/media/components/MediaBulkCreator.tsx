"use client";

import Link from "next/link";
import { useState } from "react";

import { MEDIA_STORAGE_LABELS, type MediaStorage } from "../types/media.types";
import { useMediaBulkUpload } from "../hooks/useMediaBulkUpload";
import { useMediaStorageOptions } from "../hooks/useMediaStorageOptions";

import { MediaStoragePicker } from "./MediaStoragePicker";
import { MediaUploadPanel } from "./MediaUploadPanel";
import { MediaUrlImportPanel } from "./MediaUrlImportPanel";

/**
 * Màn Thêm media, 2 bước: (1) chọn nơi lưu — Server, Vietnix, Cloudinary hoặc Liên kết ngoài; (2) tải nhiều file lên
 * nơi đó, hoặc dán danh sách URL nếu chọn Liên kết ngoài. Backend chưa có API tạo hàng loạt nên mỗi file/URL
 * vẫn đi qua đúng API tạo một media hiện có (upload / POST /media). Sửa một media vẫn dùng MediaEditor.
 */
export function MediaBulkCreator() {
  const storageOptions = useMediaStorageOptions();
  const [chosenStorage, setChosenStorage] = useState<MediaStorage | null>(null);

  // Chưa bấm chọn thì dùng nơi mặc định của server (nếu nơi đó đang dùng được).
  const defaultStorage = storageOptions.data?.find((option) => option.isDefault && option.isAvailable)?.code ?? null;
  const storage = chosenStorage ?? defaultStorage;

  const upload = useMediaBulkUpload(storage && storage !== "external" ? storage : "local");
  const isFileStorage = storage !== null && storage !== "external";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black text-brand-greenDark">Thêm media</h1>
        <Link
          href="/admin/catalog/media"
          className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="mt-4 space-y-6 rounded-lg border border-brand-line bg-white p-4 sm:p-6">
        <MediaStoragePicker
          value={storage}
          onChange={setChosenStorage}
          options={storageOptions.data}
          isLoading={storageOptions.isLoading}
          error={storageOptions.error}
          onRetry={storageOptions.reload}
          disabled={upload.isUploading}
        />

        <section className="space-y-3 border-t border-brand-line pt-5" aria-labelledby="media-create-step-2">
          <h2 id="media-create-step-2" className="text-[14px] font-black text-brand-greenDark">
            {storage === "external"
              ? "2. Nhập link"
              : storage
                ? `2. Tải file lên — lưu vào ${MEDIA_STORAGE_LABELS[storage]}`
                : "2. Tải file lên"}
          </h2>

          {!storage && <p className="text-[13px] text-brand-muted">Chọn nơi lưu ở bước 1 để tiếp tục.</p>}

          {/* Giữ cả 2 panel trong DOM (chỉ ẩn) để đổi nơi lưu không làm mất danh sách đang xử lý dở. */}
          <div hidden={!isFileStorage}>
            <MediaUploadPanel upload={upload} />
          </div>
          <div hidden={storage !== "external"}>
            <MediaUrlImportPanel />
          </div>
        </section>
      </div>
    </div>
  );
}
