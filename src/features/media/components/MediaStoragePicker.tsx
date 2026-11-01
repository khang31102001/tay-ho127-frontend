"use client";

import { Cloud, Link2, Server, type LucideIcon } from "lucide-react";

import { cn } from "@/core/utils/cn";
import { MEDIA_STORAGE_LABELS, type MediaStorage, type MediaStorageOption } from "../types/media.types";

const STORAGE_CARDS: { value: MediaStorage; icon: LucideIcon; description: string }[] = [
  {
    value: "local",
    icon: Server,
    description: "Lưu trên ổ đĩa VPS. Không phụ thuộc dịch vụ ngoài, nhưng tốn dung lượng và băng thông server.",
  },
  {
    value: "cloudinary",
    icon: Cloud,
    description: "Lưu lên Cloudinary, ảnh tải qua CDN và không tốn tài nguyên server. Gói Free giới hạn dung lượng mỗi tháng.",
  },
  {
    value: "external",
    icon: Link2,
    description:
      "Không lưu file, chỉ ghi lại link có sẵn. Link chết thì mất ảnh; domain chưa khai báo sẽ không chọn được cho nội dung Site.",
  },
];

type MediaStoragePickerProps = {
  value: MediaStorage | null;
  onChange: (value: MediaStorage) => void;
  /** undefined khi đang tải hoặc tải lỗi — khi đó Server/Cloud chưa chọn được. */
  options: MediaStorageOption[] | undefined;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Khóa cả nhóm (vd. đang tải file lên) để một đợt không bị lẫn hai nơi lưu. */
  disabled: boolean;
};

/** Bước 1 của màn Thêm media: chọn file được lưu ở đâu (Server, Cloudinary) hay chỉ nhập link ngoài. */
export function MediaStoragePicker({ value, onChange, options, isLoading, error, onRetry, disabled }: MediaStoragePickerProps) {
  function optionOf(storage: MediaStorage) {
    return options?.find((option) => option.code === storage);
  }

  function unavailableReason(storage: MediaStorage): string | null {
    if (storage === "external") return null;
    if (isLoading) return "Đang kiểm tra...";
    if (!options) return "Không kiểm tra được";
    return optionOf(storage)?.isAvailable ? null : "Chưa cấu hình trên server";
  }

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-[14px] font-black text-brand-greenDark">1. Chọn nơi lưu</legend>

      {error && (
        <p className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-red-700">
          {error}
          <button type="button" onClick={onRetry} className="font-bold underline underline-offset-2">
            Thử lại
          </button>
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {STORAGE_CARDS.map(({ value: storage, icon: Icon, description }) => {
          const reason = unavailableReason(storage);
          const isSelected = value === storage;
          const isDefault = optionOf(storage)?.isDefault ?? false;
          return (
            <label
              key={storage}
              className={cn(
                "flex cursor-pointer gap-3 rounded-lg border p-4 transition",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-green/40",
                isSelected ? "border-brand-green bg-brand-green/5" : "border-brand-line hover:border-brand-green/60",
                (reason || disabled) && "cursor-not-allowed opacity-60 hover:border-brand-line",
              )}
            >
              <input
                type="radio"
                name="media-storage"
                value={storage}
                checked={isSelected}
                disabled={reason !== null}
                onChange={() => onChange(storage)}
                className="sr-only"
              />
              <Icon className={cn("mt-0.5 size-5 shrink-0", isSelected ? "text-brand-green" : "text-brand-muted")} aria-hidden />
              <span className="min-w-0 space-y-1">
                <span className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-brand-greenDark">
                  {MEDIA_STORAGE_LABELS[storage]}
                  {isDefault && (
                    <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[11px] font-bold text-brand-muted">Mặc định</span>
                  )}
                </span>
                <span className="block text-[12px] leading-relaxed text-brand-muted">{description}</span>
                {reason && <span className="block text-[12px] font-bold text-brand-muted">{reason}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
