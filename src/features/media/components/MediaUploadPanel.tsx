"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { RotateCcw, UploadCloud, X } from "lucide-react";

import { cn } from "@/core/utils/cn";
import { formatFileSize } from "@/core/utils/format-file-size";
import { adminFieldLabelClassName } from "@/shared/admin/templates/formFieldClassName";

import { useMediaBulkUpload } from "../hooks/useMediaBulkUpload";
import { MEDIA_UPLOAD_ACCEPT, MEDIA_UPLOAD_MAX_BYTES } from "../services/media-library.service";
import { MEDIA_ALT_TEXT_MAX_LENGTH } from "../utils/media-batch";

import {
  CopyTextButton,
  MediaBatchProgress,
  MediaBatchStatusBadge,
  MediaBatchThumbnail,
  MediaBatchUrlField,
  mediaBatchCompactInputClassName,
  mediaBatchPrimaryButtonClassName,
  mediaBatchSecondaryButtonClassName,
} from "./MediaBatchParts";

/** Tab "Tải file lên": kéo-thả / chọn nhiều file, upload song song, theo dõi và thử lại từng file. */
export function MediaUploadPanel() {
  const {
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
  } = useMediaBulkUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sharedAltText, setSharedAltText] = useState("");

  // Thả file lệch ra ngoài vùng thả thì trình duyệt mặc định mở file đó → mất cả danh sách đang tải.
  useEffect(() => {
    function preventFileNavigation(event: globalThis.DragEvent) {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    }
    window.addEventListener("dragover", preventFileNavigation);
    window.addEventListener("drop", preventFileNavigation);
    return () => {
      window.removeEventListener("dragover", preventFileNavigation);
      window.removeEventListener("drop", preventFileNavigation);
    };
  }, []);

  const uploadableCount = summary.pending + summary.failed;
  const successUrls = items.flatMap((item) => (item.media ? [item.media.url] : []));

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-5">
      <div
        role="button"
        tabIndex={0}
        aria-label="Kéo thả file vào đây hoặc bấm để chọn file"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={(event) => {
          // Chỉ tắt highlight khi con trỏ rời hẳn vùng thả, không phải khi đi qua phần tử con.
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40",
          isDragging ? "border-brand-green bg-brand-green/5" : "border-brand-line hover:border-brand-green/60 hover:bg-brand-cream/40",
        )}
      >
        <UploadCloud className={cn("size-10", isDragging ? "text-brand-green" : "text-brand-muted")} aria-hidden />
        <p className="text-[14px] font-bold text-brand-greenDark">
          {isDragging ? "Thả file để thêm vào danh sách" : "Kéo & thả file vào đây, hoặc bấm để chọn nhiều file"}
        </p>
        <p className="text-[12px] text-brand-muted">
          Ảnh (JPG, PNG, GIF, WEBP), video MP4/WebM hoặc PDF — tối đa {MEDIA_UPLOAD_MAX_BYTES / (1024 * 1024)}MB mỗi file.
          Tên file, loại, dung lượng và URL do hệ thống tự điền sau khi tải lên.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={MEDIA_UPLOAD_ACCEPT}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            // Reset để chọn lại đúng file đó (vd. sau khi xóa khỏi danh sách) vẫn kích hoạt onChange.
            event.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="flex flex-col gap-3 rounded-lg border border-brand-line bg-brand-cream/30 p-4 sm:flex-row sm:items-end">
            <label className={cn(adminFieldLabelClassName, "flex-1")}>
              Alt text chung (tùy chọn)
              <input
                type="text"
                maxLength={MEDIA_ALT_TEXT_MAX_LENGTH}
                value={sharedAltText}
                onChange={(event) => setSharedAltText(event.target.value)}
                placeholder="Áp dụng cho mọi file chưa tải lên, sau đó vẫn sửa riêng được"
                className={cn(mediaBatchCompactInputClassName, "mt-1.5 bg-white")}
              />
            </label>
            <button
              type="button"
              onClick={() => applyAltTextToAll(sharedAltText)}
              disabled={uploadableCount === 0}
              className={mediaBatchSecondaryButtonClassName}
            >
              Áp dụng cho tất cả
            </button>
          </div>

          <MediaBatchProgress
            total={summary.total}
            success={summary.success}
            failed={summary.failed + summary.rejected}
            processing={summary.processing}
          />

          <ul className="divide-y divide-brand-line rounded-lg border border-brand-line">
            {items.map((item) => {
              const isLocked = item.status === "processing" || item.status === "success" || item.isRejected;
              return (
                <li key={item.key} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
                  <MediaBatchThumbnail src={item.previewUrl} type={item.type} alt={item.file.name} />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 truncate text-[13px] font-bold text-brand-ink" title={item.file.name}>
                        {item.media?.fileName ?? item.file.name}
                      </span>
                      <span className="text-[12px] text-brand-muted">{formatFileSize(item.media?.size ?? item.file.size)}</span>
                      <MediaBatchStatusBadge
                        status={item.status}
                        label={item.isRejected ? "Không hợp lệ" : undefined}
                      />
                    </div>

                    {item.error && <p className="text-[12px] font-medium text-red-700">{item.error}</p>}

                    {item.media ? (
                      <MediaBatchUrlField url={item.media.url} />
                    ) : (
                      !item.isRejected && (
                        <input
                          type="text"
                          maxLength={MEDIA_ALT_TEXT_MAX_LENGTH}
                          value={item.altText}
                          disabled={isLocked}
                          onChange={(event) => updateAltText(item.key, event.target.value)}
                          placeholder="Alt text (tùy chọn)"
                          aria-label={`Alt text cho ${item.file.name}`}
                          className={mediaBatchCompactInputClassName}
                        />
                      )
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
                    {item.status === "error" && !item.isRejected && (
                      <button
                        type="button"
                        onClick={() => retryItem(item.key)}
                        className={cn(mediaBatchSecondaryButtonClassName, "inline-flex items-center gap-1.5")}
                      >
                        <RotateCcw className="size-3.5" aria-hidden />
                        Thử lại
                      </button>
                    )}
                    {item.status !== "processing" && item.status !== "success" && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Bỏ ${item.file.name} khỏi danh sách`}
                        className="rounded-lg p-2 text-brand-muted transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-5">
            <div className="flex flex-wrap gap-2">
              {summary.failed > 0 && (
                <button type="button" onClick={retryFailed} disabled={isUploading} className={mediaBatchSecondaryButtonClassName}>
                  Thử lại {summary.failed} file lỗi
                </button>
              )}
              {successUrls.length > 0 && (
                <CopyTextButton text={successUrls.join("\n")} label={`Sao chép ${successUrls.length} URL`} />
              )}
              {(summary.success > 0 || summary.rejected > 0) && (
                <button type="button" onClick={clearFinished} disabled={isUploading} className={mediaBatchSecondaryButtonClassName}>
                  Dọn file đã xong
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={uploadAll}
              disabled={isUploading || uploadableCount === 0}
              className={mediaBatchPrimaryButtonClassName}
            >
              {isUploading ? "Đang tải lên..." : `Tải lên ${uploadableCount} file`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
