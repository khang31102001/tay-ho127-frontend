"use client";

import { useEffect, useState } from "react";
import { Check, Copy, FileText, ImageOff, Loader2, Video } from "lucide-react";

import { cn } from "@/core/utils/cn";
import type { MediaType } from "../types/media.types";

import type { MediaBatchStatus } from "../hooks/useMediaBulkUpload";

/** Phần UI dùng chung của 2 tab Thêm media hàng loạt (tải file / nhập URL). */

export const mediaBatchPrimaryButtonClassName =
  "rounded-lg bg-brand-red px-5 py-2.5 text-[13px] font-black text-white transition hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-60";

export const mediaBatchSecondaryButtonClassName =
  "rounded-lg border border-brand-line px-3 py-2 text-[13px] font-bold text-brand-greenDark transition hover:bg-brand-green/5 disabled:cursor-not-allowed disabled:opacity-50";

export const mediaBatchCompactInputClassName =
  "h-9 w-full rounded-lg border border-brand-line px-3 text-[13px] outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:bg-brand-line/30";

const STATUS_STYLES: Record<MediaBatchStatus, { label: string; className: string }> = {
  pending: { label: "Chờ xử lý", className: "bg-brand-muted/10 text-brand-muted" },
  processing: { label: "Đang xử lý", className: "bg-amber-50 text-amber-700" },
  success: { label: "Thành công", className: "bg-brand-green/10 text-brand-greenDark" },
  error: { label: "Lỗi", className: "bg-red-50 text-red-700" },
};

export function MediaBatchStatusBadge({ status, label }: { status: MediaBatchStatus; label?: string }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold", style.className)}>
      {status === "processing" && <Loader2 className="size-3 animate-spin" aria-hidden />}
      {label ?? style.label}
    </span>
  );
}

/** Ảnh xem trước 56px; video/tài liệu hoặc ảnh không tải được thì hiện icon. */
export function MediaBatchThumbnail({ src, type, alt }: { src: string | null; type: MediaType; alt: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [src]);

  if (type === "image" && src && !hasError) {
    return (
      // Blob URL cục bộ hoặc URL bất kỳ người dùng dán vào: next/image không tối ưu được, dùng <img> thường.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="size-14 shrink-0 rounded-md border border-brand-line object-cover"
      />
    );
  }

  const Icon = type === "video" ? Video : type === "document" ? FileText : ImageOff;
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-brand-cream text-brand-muted">
      <Icon className="size-6" aria-hidden />
    </span>
  );
}

export function CopyTextButton({ text, label = "Sao chép URL" }: { text: string; label?: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (!isCopied && !hasFailed) return;
    const timer = window.setTimeout(() => {
      setIsCopied(false);
      setHasFailed(false);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isCopied, hasFailed]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      // Clipboard API bị chặn (http không bảo mật / quyền trình duyệt): báo để người dùng tự bôi đen sao chép.
      setHasFailed(true);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className={cn(mediaBatchSecondaryButtonClassName, "inline-flex items-center gap-1.5 whitespace-nowrap")}
    >
      {isCopied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {isCopied ? "Đã sao chép" : hasFailed ? "Không sao chép được" : label}
    </button>
  );
}

/** URL đã xác nhận từ Backend: chọn được để bôi đen + nút sao chép. */
export function MediaBatchUrlField({ url }: { url: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        type="text"
        readOnly
        value={url}
        aria-label="URL media"
        onFocus={(event) => event.currentTarget.select()}
        className={cn(mediaBatchCompactInputClassName, "min-w-0 flex-1 bg-brand-cream/40 text-brand-ink")}
      />
      <CopyTextButton text={url} label="Sao chép" />
    </div>
  );
}

type MediaBatchProgressProps = {
  total: number;
  success: number;
  failed: number;
  processing: number;
};

export function MediaBatchProgress({ total, success, failed, processing }: MediaBatchProgressProps) {
  if (total === 0) return null;
  const donePercent = Math.round(((success + failed) / total) * 100);

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-bold">
        <span className="text-brand-ink">Tổng: {total}</span>
        <span className="text-brand-greenDark">Thành công: {success}</span>
        <span className="text-red-700">Lỗi: {failed}</span>
        {processing > 0 && <span className="text-amber-700">Đang xử lý: {processing}</span>}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-brand-line/50"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={donePercent}
      >
        <div className="flex h-full">
          <div className="bg-brand-green transition-all" style={{ width: `${(success / total) * 100}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${(failed / total) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
