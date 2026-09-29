"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";

import { usePermissionEditor } from "../hooks/usePermissionEditor";

export function PermissionEditor({ id }: { id?: string }) {
  const { form, updateField, isLoading, loadError, isEditMode, handleSave, handleDelete, goToExplore } =
    usePermissionEditor({ id });
  const { hasPermission } = useAdminAuth();

  return (
    <DataEditor
      title={isEditMode ? "Sửa quyền" : "Thêm quyền"}
      backHref="/admin/permissions"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("permissions.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmDescription="Không xóa được quyền đang gán cho vai trò — hãy gỡ khỏi vai trò trước."
    >
      <label className={adminFieldLabelClassName}>
        Mã quyền
        <input
          type="text"
          required
          disabled={isEditMode}
          placeholder="vd. reports.view"
          value={form.code}
          onChange={(event) => updateField("code", event.target.value)}
          className={`${adminFieldInputClassName} font-mono disabled:bg-brand-line/30`}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        Mô tả
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      {isEditMode && (
        <label className={adminFieldLabelClassName}>
          Trạng thái
          <select
            value={form.isActive ? "active" : "inactive"}
            onChange={(event) => updateField("isActive", event.target.value === "active")}
            className={adminFieldInputClassName}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
      )}
    </DataEditor>
  );
}
