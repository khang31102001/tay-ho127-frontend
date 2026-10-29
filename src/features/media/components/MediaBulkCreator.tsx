"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "@/core/utils/cn";

import { MediaUploadPanel } from "./MediaUploadPanel";
import { MediaUrlImportPanel } from "./MediaUrlImportPanel";

type MediaCreateMode = "upload" | "url";

const CREATE_MODE_OPTIONS: { value: MediaCreateMode; label: string }[] = [
  { value: "upload", label: "Tải file lên" },
  { value: "url", label: "Nhập URL" },
];

/**
 * Màn Thêm media: tạo nhiều media một lần (kéo-thả file hoặc dán danh sách URL). Backend chưa có API
 * tạo hàng loạt nên mỗi file/URL vẫn đi qua đúng API tạo một media hiện có (upload / POST /media).
 * Sửa một media vẫn dùng MediaEditor.
 */
export function MediaBulkCreator() {
  const [mode, setMode] = useState<MediaCreateMode>("upload");

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

      <div className="mt-4 space-y-5 rounded-lg border border-brand-line bg-white p-4 sm:p-6">
        <div className="flex gap-2" role="tablist" aria-label="Cách thêm media">
          {CREATE_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              id={`media-create-tab-${option.value}`}
              aria-selected={mode === option.value}
              aria-controls={`media-create-panel-${option.value}`}
              onClick={() => setMode(option.value)}
              className={cn(
                "rounded-lg border px-4 py-2 text-[13px] font-bold transition",
                mode === option.value
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-brand-line text-brand-greenDark hover:bg-brand-green/5",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Giữ cả 2 panel trong DOM (chỉ ẩn) để chuyển tab không làm mất danh sách đang xử lý dở. */}
        {CREATE_MODE_OPTIONS.map((option) => (
          <div
            key={option.value}
            role="tabpanel"
            id={`media-create-panel-${option.value}`}
            aria-labelledby={`media-create-tab-${option.value}`}
            hidden={mode !== option.value}
          >
            {option.value === "upload" ? <MediaUploadPanel /> : <MediaUrlImportPanel />}
          </div>
        ))}
      </div>
    </div>
  );
}
