"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";
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
};

type MediaPickerProps = MediaPickerBaseProps & {
  selectedId: string | null;
  onChange: (mediaId: string | null) => void;
};

type MediaMultiPickerProps = MediaPickerBaseProps & {
  selectedIds: string[];
  onChange: (mediaIds: string[]) => void;
};

function useMediaPickerKinds({ mediaType, allowedTypes }: MediaPickerBaseProps) {
  const kinds = normalizeMediaKinds(allowedTypes ?? (mediaType ? [mediaType] : undefined));
  return { kinds, kindLabel: getMediaKindLabel(kinds) };
}

const actionButtonClassName =
  "rounded-lg border border-brand-line px-3 py-1.5 text-[12px] font-bold text-brand-greenDark transition hover:bg-brand-green/5";

/**
 * Ô chọn 1 media từ thư viện (features/media): chưa chọn → nút "Chọn ảnh/video/file";
 * đã chọn → thumbnail + tên + Thay đổi/Xóa. Danh sách media nằm trong modal
 * (MediaPickerDialog), không còn render dài trong form. Giá trị trả về vẫn là
 * mediaId | null như trước nên các form không phải đổi logic lưu.
 */
export function MediaPicker({
  label = "Media",
  mediaOptions,
  selectedId,
  onChange,
  isLoading,
  ...kindProps
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { kinds, kindLabel } = useMediaPickerKinds({ label, mediaOptions, ...kindProps });

  const selectedMedia = selectedId ? mediaOptions.find((media) => media.id === selectedId) : undefined;

  return (
    <div>
      <span className={adminFieldLabelClassName}>{label}</span>

      {selectedId ? (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2">
          {selectedMedia ? (
            <MediaThumb media={selectedMedia} />
          ) : (
            <span className="size-10 shrink-0 rounded bg-brand-cream" />
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
          title={`Chọn ${kindLabel}`}
          mediaOptions={mediaOptions}
          allowedTypes={kinds}
          initialSelectedIds={selectedId ? [selectedId] : []}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          onConfirm={(ids) => {
            onChange(ids[0] ?? null);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Bản đa chọn của MediaPicker (cùng modal) — dùng cho Product (mediaIds[]).
 * Thứ tự phần tử được giữ: phần tử đầu là media chính.
 */
export function MediaMultiPicker({
  label = "Media",
  mediaOptions,
  selectedIds,
  onChange,
  isLoading,
  ...kindProps
}: MediaMultiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { kinds, kindLabel } = useMediaPickerKinds({ label, mediaOptions, ...kindProps });

  const selectedMedia = selectedIds
    .map((id) => mediaOptions.find((media) => media.id === id))
    .filter((media): media is ManagedMedia => media !== undefined);

  return (
    <div>
      <span className={adminFieldLabelClassName}>{label}</span>

      {selectedMedia.length > 0 && (
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {selectedMedia.map((media) => (
            <li key={media.id} className="flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2">
              <MediaThumb media={media} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-brand-ink">
                {media.fileName}
              </span>
              <button
                type="button"
                aria-label={`Bỏ ${media.fileName}`}
                onClick={() => onChange(selectedIds.filter((id) => id !== media.id))}
                className="flex size-7 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-red/10 hover:text-brand-red"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-line px-3 py-3 text-[13px] font-bold text-brand-muted transition hover:border-brand-green hover:text-brand-greenDark"
      >
        <ImagePlus className="size-4" aria-hidden="true" />
        {selectedMedia.length > 0 ? "Thêm/đổi media" : `Chọn ${kindLabel}`}
      </button>

      {isOpen && (
        <MediaPickerDialog
          title={`Chọn ${kindLabel}`}
          mediaOptions={mediaOptions}
          allowedTypes={kinds}
          initialSelectedIds={selectedIds}
          multiple
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          onConfirm={(ids) => {
            onChange(ids);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
