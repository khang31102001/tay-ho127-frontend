"use client";

import { useEffect, useState } from "react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import { formatFileSize } from "@/lib/format-file-size";
import { MEDIA_TYPE_OPTIONS, type MediaType } from "../types/media.types";

import { type MediaSourceMode, useMediaEditor } from "../hooks/useMediaEditor";
import { MEDIA_UPLOAD_ACCEPT, MEDIA_UPLOAD_MAX_BYTES } from "../services/media-library.service";

type MediaEditorProps = {
  id?: string;
};

const SOURCE_MODE_OPTIONS: { value: MediaSourceMode; label: string }[] = [
  { value: "upload", label: "Tải file lên" },
  { value: "url", label: "Nhập URL" },
];

/** Xem trước file vừa chọn: ảnh hiện thumbnail, loại khác hiện tên + dung lượng. */
function SelectedFilePreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg border border-brand-line px-3 py-2">
      {previewUrl ? (
        // Blob URL cục bộ: next/image không tối ưu được, dùng <img> thường là đúng chủ đích.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={file.name} className="size-14 rounded-md object-cover" />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-[13px] text-brand-ink">
        {file.name} — {formatFileSize(file.size)}
      </span>
    </div>
  );
}

export function MediaEditor({ id }: MediaEditorProps) {
  const {
    form,
    status,
    sourceMode,
    setSourceMode,
    file,
    setFile,
    updateField,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useMediaEditor({ id });
  const { hasPermission } = useAdminAuth();

  // Sửa media luôn là nhập tay metadata/URL; upload chỉ áp dụng khi tạo mới.
  const isUploadMode = !isEditMode && sourceMode === "upload";

  return (
    <DataEditor
      title={isEditMode ? "Sửa media" : "Thêm media"}
      backHref="/admin/catalog/media"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && status === "active" && hasPermission("media.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmTitle="Ngừng sử dụng media này?"
      deleteConfirmDescription="Media sẽ chuyển sang Ngừng hoạt động và không còn hiển thị trên Site."
    >
      {isEditMode && (
        <p className="flex items-center gap-2 text-[13px] text-brand-muted">
          Trạng thái: <StatusBadge status={status} />
        </p>
      )}

      {!isEditMode && (
        <div className="flex gap-2" role="tablist" aria-label="Cách thêm media">
          {SOURCE_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={sourceMode === option.value}
              onClick={() => setSourceMode(option.value)}
              className={`rounded-lg border px-4 py-2 text-[13px] font-bold transition ${
                sourceMode === option.value
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-brand-line text-brand-greenDark hover:bg-brand-green/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {isUploadMode ? (
        <div>
          <label className={adminFieldLabelClassName}>
            File (ảnh, video MP4/WebM hoặc PDF — tối đa {MEDIA_UPLOAD_MAX_BYTES / (1024 * 1024)}MB)
            <input
              type="file"
              required
              accept={MEDIA_UPLOAD_ACCEPT}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className={adminFieldInputClassName}
            />
          </label>
          {file && <SelectedFilePreview file={file} />}
          <p className="mt-2 text-[12px] text-brand-muted">
            Tên file, loại và dung lượng được hệ thống tự điền sau khi tải lên.
          </p>
        </div>
      ) : (
        <>
          <label className={adminFieldLabelClassName}>
            Tên file
            <input
              type="text"
              required
              value={form.fileName}
              onChange={(event) => updateField("fileName", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>

          <label className={adminFieldLabelClassName}>
            URL
            <input
              type="text"
              required
              placeholder="https://... hoặc /images/ten-file.jpg"
              value={form.url}
              onChange={(event) => updateField("url", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={adminFieldLabelClassName}>
              Loại file
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value as MediaType)}
                className={adminFieldInputClassName}
              >
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={adminFieldLabelClassName}>
              Dung lượng (byte) — {formatFileSize(form.size)}
              <input
                type="number"
                min={0}
                disabled={isEditMode}
                title={isEditMode ? "Không sửa được dung lượng sau khi tạo." : undefined}
                value={form.size}
                onChange={(event) => updateField("size", Number(event.target.value))}
                className={`${adminFieldInputClassName} disabled:bg-brand-line/30`}
              />
            </label>
          </div>
        </>
      )}

      <label className={adminFieldLabelClassName}>
        Alt text (tùy chọn)
        <input
          type="text"
          value={form.altText ?? ""}
          onChange={(event) => updateField("altText", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>
    </DataEditor>
  );
}
