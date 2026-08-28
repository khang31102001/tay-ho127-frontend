"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { PERMISSION_OPTIONS } from "../types/role.types";

import { useRoleEditor } from "../hooks/useRoleEditor";

type RoleEditorProps = {
  id?: string;
};

export function RoleEditor({ id }: RoleEditorProps) {
  const {
    form,
    updateField,
    togglePermission,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useRoleEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa vai trò" : "Thêm vai trò"}
      backHref="/admin/roles"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Tên vai trò
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        Mô tả (tùy chọn)
        <input
          type="text"
          value={form.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div>
        <span className={adminFieldLabelClassName}>Quyền hạn</span>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PERMISSION_OPTIONS.map((permission) => (
            <label
              key={permission.key}
              className="flex items-center gap-2 rounded-lg border border-brand-line px-3 py-2 text-[13px] font-medium text-brand-ink"
            >
              <input
                type="checkbox"
                checked={form.permissions.includes(permission.key)}
                onChange={() => togglePermission(permission.key)}
                className="size-4 accent-brand-green"
              />
              {permission.label}
            </label>
          ))}
        </div>
      </div>

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
