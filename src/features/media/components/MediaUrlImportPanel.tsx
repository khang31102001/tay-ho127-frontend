"use client";

import { useState } from "react";
import { RotateCcw, X } from "lucide-react";

import { cn } from "@/core/utils/cn";
import { formatFileSize } from "@/core/utils/format-file-size";
import { adminFieldLabelClassName } from "@/shared/admin/templates/formFieldClassName";
import { MEDIA_TYPE_OPTIONS, type MediaType } from "../types/media.types";

import { getUrlRowErrors, useMediaUrlImport } from "../hooks/useMediaUrlImport";
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

const invalidInputClassName = "border-red-400 focus:border-red-500 focus:ring-red-200";

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-[11px] font-medium text-red-700">{message}</span> : null;
}

/** Tab "Nhập URL": dán danh sách URL → mỗi URL thành một dòng media, kiểm tra rồi tạo hàng loạt. */
export function MediaUrlImportPanel() {
  const {
    rows,
    rawText,
    setRawText,
    notice,
    summary,
    isSaving,
    isValidationVisible,
    addUrlsFromText,
    updateField,
    removeRow,
    applyToAll,
    saveAll,
    retryRow,
    clearSaved,
  } = useMediaUrlImport();
  const [sharedAltText, setSharedAltText] = useState("");
  const [sharedType, setSharedType] = useState<MediaType>("image");

  const savableCount = summary.pending + summary.failed;
  const successUrls = rows.flatMap((row) => (row.media ? [row.media.url] : []));

  return (
    <div className="space-y-5">
      <div>
        <label className={adminFieldLabelClassName}>
          Danh sách URL (mỗi dòng một URL)
          <textarea
            rows={5}
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder={"https://cdn.example.com/anh-1.jpg\nhttps://cdn.example.com/anh-2.png\n/images/ten-file.jpg"}
            className="mt-1.5 w-full rounded-lg border border-brand-line px-4 py-3 font-mono text-[13px] outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addUrlsFromText}
            disabled={rawText.trim() === ""}
            className={mediaBatchSecondaryButtonClassName}
          >
            Thêm vào danh sách
          </button>
          <span className="text-[12px] text-brand-muted">
            Tên file và loại được điền sẵn theo đuôi URL; kiểm tra lại trước khi lưu.
          </span>
        </div>
      </div>

      {notice && (
        <p
          className={cn(
            "rounded-lg px-4 py-2.5 text-[13px] font-medium",
            notice.tone === "error" ? "bg-red-50 text-red-700" : "bg-brand-cream/60 text-brand-ink",
          )}
          role="status"
        >
          {notice.text}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="grid gap-3 rounded-lg border border-brand-line bg-brand-cream/30 p-4 sm:grid-cols-[1fr_auto_160px_auto] sm:items-end">
            <label className={adminFieldLabelClassName}>
              Alt text chung (tùy chọn)
              <input
                type="text"
                maxLength={MEDIA_ALT_TEXT_MAX_LENGTH}
                value={sharedAltText}
                onChange={(event) => setSharedAltText(event.target.value)}
                className={cn(mediaBatchCompactInputClassName, "mt-1.5 bg-white")}
              />
            </label>
            <button
              type="button"
              onClick={() => applyToAll({ altText: sharedAltText })}
              disabled={savableCount === 0}
              className={mediaBatchSecondaryButtonClassName}
            >
              Áp dụng Alt text
            </button>
            <label className={adminFieldLabelClassName}>
              Loại file chung
              <select
                value={sharedType}
                onChange={(event) => setSharedType(event.target.value as MediaType)}
                className={cn(mediaBatchCompactInputClassName, "mt-1.5 bg-white")}
              >
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => applyToAll({ type: sharedType })}
              disabled={savableCount === 0}
              className={mediaBatchSecondaryButtonClassName}
            >
              Áp dụng loại
            </button>
          </div>

          <MediaBatchProgress
            total={summary.total}
            success={summary.success}
            failed={summary.failed}
            processing={summary.processing}
          />

          <ul className="divide-y divide-brand-line rounded-lg border border-brand-line">
            {rows.map((row) => {
              const isLocked = row.status === "processing" || row.status === "success";
              const errors = isValidationVisible && !isLocked ? getUrlRowErrors(row, rows) : {};
              return (
                <li key={row.key} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start">
                  <MediaBatchThumbnail src={row.url.trim() || null} type={row.type} alt={row.altText || row.fileName} />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <MediaBatchStatusBadge status={row.status} />
                      {row.error && <span className="text-[12px] font-medium text-red-700">{row.error}</span>}
                    </div>

                    {row.media ? (
                      <>
                        <p className="truncate text-[13px] font-bold text-brand-ink" title={row.media.fileName}>
                          {row.media.fileName}
                        </p>
                        <MediaBatchUrlField url={row.media.url} />
                      </>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="block text-[12px] font-bold text-brand-greenDark md:col-span-2">
                          URL *
                          <input
                            type="text"
                            value={row.url}
                            disabled={isLocked}
                            onChange={(event) => updateField(row.key, "url", event.target.value)}
                            className={cn(mediaBatchCompactInputClassName, "mt-1", errors.url && invalidInputClassName)}
                          />
                          <FieldError message={errors.url} />
                        </label>
                        <label className="block text-[12px] font-bold text-brand-greenDark">
                          Tên file *
                          <input
                            type="text"
                            value={row.fileName}
                            disabled={isLocked}
                            onChange={(event) => updateField(row.key, "fileName", event.target.value)}
                            className={cn(mediaBatchCompactInputClassName, "mt-1", errors.fileName && invalidInputClassName)}
                          />
                          <FieldError message={errors.fileName} />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block text-[12px] font-bold text-brand-greenDark">
                            Loại file
                            <select
                              value={row.type}
                              disabled={isLocked}
                              onChange={(event) => updateField(row.key, "type", event.target.value as MediaType)}
                              className={cn(mediaBatchCompactInputClassName, "mt-1")}
                            >
                              {MEDIA_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-[12px] font-bold text-brand-greenDark">
                            Dung lượng (byte)
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={row.size}
                              disabled={isLocked}
                              title={formatFileSize(row.size)}
                              onChange={(event) => updateField(row.key, "size", Number(event.target.value))}
                              className={cn(mediaBatchCompactInputClassName, "mt-1", errors.size && invalidInputClassName)}
                            />
                            <FieldError message={errors.size} />
                          </label>
                        </div>
                        <label className="block text-[12px] font-bold text-brand-greenDark md:col-span-2">
                          Alt text (tùy chọn)
                          <input
                            type="text"
                            maxLength={MEDIA_ALT_TEXT_MAX_LENGTH}
                            value={row.altText}
                            disabled={isLocked}
                            onChange={(event) => updateField(row.key, "altText", event.target.value)}
                            className={cn(mediaBatchCompactInputClassName, "mt-1", errors.altText && invalidInputClassName)}
                          />
                          <FieldError message={errors.altText} />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
                    {row.status === "error" && (
                      <button
                        type="button"
                        onClick={() => retryRow(row.key)}
                        className={cn(mediaBatchSecondaryButtonClassName, "inline-flex items-center gap-1.5")}
                      >
                        <RotateCcw className="size-3.5" aria-hidden />
                        Thử lại
                      </button>
                    )}
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        aria-label="Bỏ dòng này"
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
              {successUrls.length > 0 && (
                <CopyTextButton text={successUrls.join("\n")} label={`Sao chép ${successUrls.length} URL`} />
              )}
              {summary.success > 0 && (
                <button type="button" onClick={clearSaved} disabled={isSaving} className={mediaBatchSecondaryButtonClassName}>
                  Dọn dòng đã lưu
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={saveAll}
              disabled={isSaving || savableCount === 0}
              className={mediaBatchPrimaryButtonClassName}
            >
              {isSaving ? "Đang lưu..." : `Lưu ${savableCount} media`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
