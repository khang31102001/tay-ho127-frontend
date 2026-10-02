"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";

import { useRedirectEditor } from "../hooks/useRedirectEditor";
import type { RedirectType } from "../types/redirect.types";

type RedirectEditorProps = {
  id?: string;
};

export function RedirectEditor({ id }: RedirectEditorProps) {
  const {
    form,
    updateField,
    isLoading,
    isEditMode,
    isSourcePathAvailable,
    handleSave,
    handleDelete,
    goToExplore,
  } = useRedirectEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa redirect" : "Thêm redirect"}
      backHref="/admin/seo/redirects"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Source path (URL cũ)
        <input
          type="text"
          required
          value={form.sourcePath}
          onChange={(event) => updateField("sourcePath", event.target.value)}
          placeholder="/thuc-don/mon-cu"
          className={adminFieldInputClassName}
        />
      </label>
      {isSourcePathAvailable === false && (
        <p className="text-[12px] font-medium text-red-600">Source path này đã được dùng cho 1 redirect khác.</p>
      )}

      <label className={adminFieldLabelClassName}>
        Destination URL (URL mới)
        <input
          type="text"
          required
          value={form.destinationUrl}
          onChange={(event) => updateField("destinationUrl", event.target.value)}
          placeholder="/thuc-don/product-bc001"
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Loại redirect
          <select
            value={form.redirectType}
            onChange={(event) => updateField("redirectType", Number(event.target.value) as RedirectType)}
            className={adminFieldInputClassName}
          >
            <option value={301}>301 — Chuyển hướng vĩnh viễn</option>
            <option value={302}>302 — Chuyển hướng tạm thời</option>
          </select>
        </label>

        <label className={adminFieldLabelClassName}>
          Trạng thái
          <select
            value={form.isActive ? "active" : "inactive"}
            onChange={(event) => updateField("isActive", event.target.value === "active")}
            className={adminFieldInputClassName}
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Tạm tắt</option>
          </select>
        </label>
      </div>
    </DataEditor>
  );
}
