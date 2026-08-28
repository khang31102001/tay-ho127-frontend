"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { formatFileSize } from "@/lib/format-file-size";
import { MEDIA_TYPE_OPTIONS, type MediaType } from "../types/media.types";

import { useMediaEditor } from "../hooks/useMediaEditor";

type MediaEditorProps = {
  id?: string;
};

export function MediaEditor({ id }: MediaEditorProps) {
  const {
    form,
    updateField,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useMediaEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa media" : "Thêm media"}
      backHref="/admin/catalog/media"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
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
          placeholder="/images/ten-file.jpg"
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
            value={form.size}
            onChange={(event) => updateField("size", Number(event.target.value))}
            className={adminFieldInputClassName}
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

      <label className={adminFieldLabelClassName}>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as EntityStatus)}
          className={adminFieldInputClassName}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </label>
    </DataEditor>
  );
}
