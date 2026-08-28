"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

import { useUserEditor } from "../hooks/useUserEditor";

type UserEditorProps = {
  id?: string;
};

export function UserEditor({ id }: UserEditorProps) {
  const {
    form,
    updateField,
    roleOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useUserEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa người dùng" : "Thêm người dùng"}
      backHref="/admin/users"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Họ tên
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Số điện thoại (tùy chọn)
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(event) => updateField("phone", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Vai trò
          <select
            required
            value={form.role}
            onChange={(event) => updateField("role", event.target.value)}
            className={adminFieldInputClassName}
          >
            <option value="" disabled>
              Chọn vai trò
            </option>

            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
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
      </div>
    </DataEditor>
  );
}
