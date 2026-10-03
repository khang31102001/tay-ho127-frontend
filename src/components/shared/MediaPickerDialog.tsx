"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, FileText, LoaderCircle, Search, Video, X } from "lucide-react";

import { BottomSheetDialog } from "@/components/ui/BottomSheetDialog";
import type { ManagedMedia, MediaType } from "@/features/media";

/** "file" là tên gọi nghiệp vụ của loại "document" (PDF, tài liệu). */
export type MediaKind = MediaType | "file";

export function normalizeMediaKinds(kinds: MediaKind[] | undefined): MediaType[] | null {
  if (!kinds || kinds.length === 0) return null;
  return kinds.map((kind) => (kind === "file" ? "document" : kind));
}

const KIND_LABEL: Record<MediaType, string> = {
  image: "ảnh",
  video: "video",
  document: "file",
};

export function getMediaKindLabel(kinds: MediaType[] | null): string {
  return kinds && kinds.length === 1 ? KIND_LABEL[kinds[0]] : "media";
}

/** Thumbnail theo loại: ảnh → preview, video/tài liệu → icon. */
export function MediaThumb({ media, className = "size-10" }: { media: ManagedMedia; className?: string }) {
  if (media.type === "image") {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded bg-brand-cream ${className}`}>
        <Image src={media.url} alt={media.altText ?? media.fileName} fill sizes="160px" className="object-cover" />
      </span>
    );
  }

  const Icon = media.type === "video" ? Video : FileText;

  return (
    <span className={`flex shrink-0 items-center justify-center rounded bg-brand-cream text-brand-muted ${className}`}>
      <Icon className="size-1/2" aria-hidden="true" />
    </span>
  );
}

/** Số media render mỗi lượt — danh sách dài chỉ vẽ dần, bấm "Xem thêm" để vẽ tiếp. */
const PAGE_SIZE = 24;

type MediaPickerDialogProps = {
  title: string;
  mediaOptions: ManagedMedia[];
  /** null = không lọc theo loại. */
  allowedTypes: MediaType[] | null;
  initialSelectedIds: string[];
  multiple?: boolean;
  isLoading?: boolean;
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
};

/**
 * Modal chọn media dùng chung (đơn/đa chọn): tìm theo tên file, lọc theo loại,
 * vùng danh sách tự cuộn trong modal. Tìm kiếm làm phía client trên danh sách
 * `mediaOptions` mà form đã tải (listMedia() — Backend /media/public tối đa 200
 * dòng, không có tham số tìm kiếm).
 */
export function MediaPickerDialog({
  title,
  mediaOptions,
  allowedTypes,
  initialSelectedIds,
  multiple = false,
  isLoading = false,
  onConfirm,
  onClose,
}: MediaPickerDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredMedia = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return mediaOptions.filter((media) => {
      if (allowedTypes && !allowedTypes.includes(media.type)) return false;
      if (!keyword) return true;
      return `${media.fileName} ${media.altText ?? ""}`.toLowerCase().includes(keyword);
    });
  }, [mediaOptions, allowedTypes, query]);

  const visibleMedia = filteredMedia.slice(0, visibleCount);
  const hiddenCount = filteredMedia.length - visibleMedia.length;

  function handleSelect(mediaId: string) {
    if (!multiple) {
      setSelectedIds([mediaId]);
      return;
    }

    setSelectedIds((previous) =>
      previous.includes(mediaId) ? previous.filter((id) => id !== mediaId) : [...previous, mediaId],
    );
  }

  const canConfirm = multiple || selectedIds.length > 0;

  return (
    <BottomSheetDialog ariaLabel={title} onClose={onClose} panelClassName="h-[80svh] sm:max-w-[720px]">
      <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
        <h2 className="text-[16px] font-black text-brand-greenDark">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex size-8 items-center justify-center rounded-lg text-brand-muted transition hover:bg-brand-green/10 hover:text-brand-greenDark"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="border-b border-brand-line px-5 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Tìm kiếm media theo tên..."
            autoFocus
            className="h-10 w-full rounded-lg border border-brand-line pl-9 pr-3 text-[14px] outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
        </div>
      </div>

      {/* Vùng duy nhất được cuộn trong modal (min-h-0 để flex-1 co lại được). */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2 text-[13px] text-brand-muted">
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            Đang tải thư viện media...
          </div>
        ) : filteredMedia.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-brand-muted">
            {mediaOptions.length === 0
              ? "Chưa có file nào trong thư viện Media."
              : "Không tìm thấy media phù hợp."}
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visibleMedia.map((media) => {
                const isSelected = selectedIds.includes(media.id);

                return (
                  <li key={media.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(media.id)}
                      aria-pressed={isSelected}
                      className={`relative flex w-full flex-col gap-2 rounded-lg border p-2 text-left transition ${
                        isSelected
                          ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green"
                          : "border-brand-line hover:border-brand-green/60"
                      }`}
                    >
                      <MediaThumb media={media} className="aspect-square w-full" />
                      <span className="truncate text-[12px] font-medium text-brand-ink">{media.fileName}</span>

                      {isSelected && (
                        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-brand-green text-white">
                          <Check className="size-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setVisibleCount((previous) => previous + PAGE_SIZE)}
                className="mt-4 w-full rounded-lg border border-brand-line py-2 text-[13px] font-bold text-brand-greenDark transition hover:bg-brand-green/5"
              >
                Xem thêm ({hiddenCount})
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-brand-line px-5 py-3">
        <span className="text-[12px] text-brand-muted">
          {multiple ? `Đã chọn ${selectedIds.length}` : ""}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-brand-line px-4 py-2 text-[13px] font-bold text-brand-muted transition hover:bg-brand-green/5"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(selectedIds)}
            className="rounded-lg bg-brand-green px-4 py-2 text-[13px] font-bold text-white transition hover:bg-brand-greenDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Chọn
          </button>
        </div>
      </div>
    </BottomSheetDialog>
  );
}
