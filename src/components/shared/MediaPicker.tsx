"use client";

import Image from "next/image";

import { adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";
import type { ManagedMedia } from "@/features/media";

type MediaPickerProps = {
  label?: string;
  mediaOptions: ManagedMedia[];
  selectedId: string | null;
  onChange: (mediaId: string | null) => void;
  emptyMessage?: string;
};

/**
 * Chọn 1 media từ thư viện dùng chung (features/media) — dùng cho PageSection,
 * Banner, Article (featured image). Product vẫn dùng checkbox-grid đa chọn
 * viết tay trong ProductEditor.tsx (mediaIds là mảng) — không đổi ở đây.
 */
export function MediaPicker({
  label = "Media",
  mediaOptions,
  selectedId,
  onChange,
  emptyMessage = "Chưa có file nào trong thư viện Media.",
}: MediaPickerProps) {
  return (
    <div>
      <span className={adminFieldLabelClassName}>{label}</span>

      {mediaOptions.length === 0 ? (
        <p className="mt-2 text-[13px] text-brand-muted">{emptyMessage}</p>
      ) : (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink">
            <input
              type="radio"
              checked={selectedId === null}
              onChange={() => onChange(null)}
              className="size-4 shrink-0 accent-brand-green"
            />
            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-brand-cream text-[11px] text-brand-muted">
              —
            </span>
            <span className="truncate">Không chọn</span>
          </label>

          {mediaOptions.map((media) => (
            <label
              key={media.id}
              className="flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink"
            >
              <input
                type="radio"
                checked={selectedId === media.id}
                onChange={() => onChange(media.id)}
                className="size-4 shrink-0 accent-brand-green"
              />

              {media.type === "image" ? (
                <Image
                  src={media.url}
                  alt={media.altText ?? media.fileName}
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="size-8 shrink-0 rounded bg-brand-cream" />
              )}

              <span className="truncate">{media.fileName}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
