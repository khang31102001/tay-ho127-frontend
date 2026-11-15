"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";

import { adminFieldLabelClassName } from "@/shared/admin/templates/formFieldClassName";
import type { ManagedMedia } from "@/features/media";

import {
  getMediaKindLabel,
  MediaPickerDialog,
  MediaThumb,
  normalizeMediaKinds,
  type MediaKind,
} from "./MediaPickerDialog";

type MediaPickerBaseProps = {
  label?: string;
  mediaOptions: ManagedMedia[];
  /** Loại media được phép chọn (mặc định: tất cả). "file" = tài liệu/PDF. */
  mediaType?: MediaKind;
  allowedTypes?: MediaKind[];
  isLoading?: boolean;
  /** Bật tab "Upload ảnh vào Media" trong popup (mặc định tắt — chỉ chọn từ thư viện). */
  allowUpload?: boolean;
  /** Media vừa tải lên/dùng lại từ tab Upload — form thêm vào `mediaOptions` để hiển thị được ngay. */
  onMediaUploaded?: (media: ManagedMedia[]) => void;
  /** Dòng gợi ý dưới nhãn. */
  hint?: string;
};

type MediaPickerProps = MediaPickerBaseProps & {
  selectedId: string | null;
  onChange: (mediaId: string | null) => void;
};

type MediaMultiPickerProps = MediaPickerBaseProps & {
  selectedIds: string[];
  onChange: (mediaIds: string[]) => void;
};

function useMediaPickerKinds({ mediaType, allowedTypes }: Pick<MediaPickerBaseProps, "mediaType" | "allowedTypes">) {
  const kinds = normalizeMediaKinds(allowedTypes ?? (mediaType ? [mediaType] : undefined));
  return { kinds, kindLabel: getMediaKindLabel(kinds) };
}

const actionButtonClassName =
  "rounded-lg border border-brand-line px-3 py-1.5 text-[12px] font-bold text-brand-greenDark transition hover:bg-brand-green/5";

const iconButtonClassName =
  "flex size-7 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark disabled:pointer-events-none disabled:opacity-30";

function FieldHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <>
      <span className={adminFieldLabelClassName}>{label}</span>
      {hint && <p className="mt-0.5 text-[12px] text-brand-muted">{hint}</p>}
    </>
  );
}

/**
 * Ô chọn 1 media từ thư viện (features/media): chưa chọn → nút "Chọn ảnh/video/file";
 * đã chọn → thumbnail + tên + Thay đổi/Xóa. Danh sách media nằm trong modal
 * (MediaPickerDialog). Giá trị trả về là mediaId | null.
 */
export function MediaPicker({
  label = "Media",
  mediaOptions,
  selectedId,
  onChange,
  isLoading,
  allowUpload,
  onMediaUploaded,
  hint,
  mediaType,
  allowedTypes,
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { kinds, kindLabel } = useMediaPickerKinds({ mediaType, allowedTypes });

  const selectedMedia = selectedId ? mediaOptions.find((media) => media.id === selectedId) : undefined;

  return (
    <div>
      <FieldHeader label={label} hint={hint} />

      {selectedId ? (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2">
          {selectedMedia ? (
            <MediaThumb media={selectedMedia} className="size-14" />
          ) : (
            <span className="size-14 shrink-0 rounded bg-brand-cream" />
          )}

          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-brand-ink">
            {selectedMedia?.fileName ?? "Media đã chọn (không tìm thấy trong thư viện)"}
          </span>

          <button type="button" onClick={() => setIsOpen(true)} className={actionButtonClassName}>
            Thay đổi
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`${actionButtonClassName} hover:border-brand-red/40 hover:bg-brand-red/10 hover:text-brand-red`}
          >
            Xóa
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-line px-3 py-3 text-[13px] font-bold text-brand-muted transition hover:border-brand-green hover:text-brand-greenDark"
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          Chọn {kindLabel}
        </button>
      )}

      {isOpen && (
        <MediaPickerDialog
          title={allowUpload ? label : `Chọn ${kindLabel}`}
          mediaOptions={mediaOptions}
          allowedTypes={kinds}
          initialSelectedIds={selectedId ? [selectedId] : []}
          isLoading={isLoading}
          allowUpload={allowUpload}
          onClose={() => setIsOpen(false)}
          onConfirm={(ids, uploadedMedia) => {
            if (uploadedMedia.length > 0) onMediaUploaded?.(uploadedMedia);
            onChange(ids[0] ?? null);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Bản đa chọn của MediaPicker (cùng modal). Thứ tự phần tử được giữ và sắp lại bằng nút lên/xuống;
 * thứ tự này là sort_order khi lưu.
 */
export function MediaMultiPicker({
  label = "Media",
  mediaOptions,
  selectedIds,
  onChange,
  isLoading,
  allowUpload,
  onMediaUploaded,
  hint,
  mediaType,
  allowedTypes,
}: MediaMultiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { kinds, kindLabel } = useMediaPickerKinds({ mediaType, allowedTypes });

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <FieldHeader label={label} hint={hint} />

      {selectedIds.length > 0 && (
        <ol className="mt-2 grid gap-2 sm:grid-cols-2">
          {selectedIds.map((mediaId, index) => {
            const media = mediaOptions.find((option) => option.id === mediaId);
            const name = media?.fileName ?? "Media không tìm thấy trong thư viện";

            return (
              <li key={mediaId} className="flex items-center gap-2 rounded-lg border border-brand-line px-2 py-2">
                <span className="w-5 shrink-0 text-center text-[12px] font-black text-brand-muted">{index + 1}</span>
                {media ? <MediaThumb media={media} /> : <span className="size-10 shrink-0 rounded bg-brand-cream" />}
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-brand-ink">{name}</span>
                <button
                  type="button"
                  aria-label={`Đưa ${name} lên trước`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className={iconButtonClassName}
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Đưa ${name} xuống sau`}
                  disabled={index === selectedIds.length - 1}
                  onClick={() => move(index, 1)}
                  className={iconButtonClassName}
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Bỏ ${name}`}
                  onClick={() => onChange(selectedIds.filter((id) => id !== mediaId))}
                  className="flex size-7 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-red/10 hover:text-brand-red"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-line px-3 py-3 text-[13px] font-bold text-brand-muted transition hover:border-brand-green hover:text-brand-greenDark"
      >
        <ImagePlus className="size-4" aria-hidden="true" />
        {selectedIds.length > 0 ? `Thêm/đổi ${kindLabel}` : `Chọn ${kindLabel}`}
      </button>

      {isOpen && (
        <MediaPickerDialog
          title={allowUpload ? label : `Chọn ${kindLabel}`}
          mediaOptions={mediaOptions}
          allowedTypes={kinds}
          initialSelectedIds={selectedIds}
          multiple
          isLoading={isLoading}
          allowUpload={allowUpload}
          onClose={() => setIsOpen(false)}
          onConfirm={(ids, uploadedMedia) => {
            if (uploadedMedia.length > 0) onMediaUploaded?.(uploadedMedia);
            onChange(ids);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
