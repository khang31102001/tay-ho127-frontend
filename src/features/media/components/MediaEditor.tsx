"use client";

import { DataEditor } from "@/shared/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/shared/admin/templates/formFieldClassName";
import { StatusBadge } from "@/shared/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import { formatFileSize } from "@/core/utils/format-file-size";
import { MEDIA_TYPE_OPTIONS, type MediaType } from "../types/media.types";

import { useMediaEditor } from "../hooks/useMediaEditor";

type MediaEditorProps = {
  id: string;
};

/** Sửa một media (metadata/URL — không đổi file đã upload). Thêm mới dùng MediaBulkCreator. */
export function MediaEditor({ id }: MediaEditorProps) {
  const {
    form,
    status,
    updateField,
    isLoading,
    loadError,
    handleSave,
    handleDelete,
    goToExplore,
  } = useMediaEditor({ id });
  const { hasPermission } = useAdminAuth();

  return (
    <DataEditor
      title="Sửa media"
      backHref="/admin/catalog/media"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={status === "active" && hasPermission("media.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmTitle="Ngừng sử dụng media này?"
      deleteConfirmDescription="Media sẽ chuyển sang Ngừng hoạt động và không còn hiển thị trên Site."
    >
      <p className="flex items-center gap-2 text-[13px] text-brand-muted">
        Trạng thái: <StatusBadge status={status} />
      </p>

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
            disabled
            title="Không sửa được dung lượng sau khi tạo."
            value={form.size}
            className={`${adminFieldInputClassName} disabled:bg-brand-line/30`}
          />
        </label>
      </div>

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
