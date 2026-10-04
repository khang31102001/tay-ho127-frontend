"use client";

import { ActiveStatusField } from "@/components/admin/templates/ActiveStatusField";
import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";

import { usePermissionEditor } from "../hooks/usePermissionEditor";

export function PermissionEditor({ id }: { id?: string }) {
  const { form, updateField, parentOptions, isLoading, loadError, isEditMode, handleSave, handleDelete, goToExplore } =
    usePermissionEditor({ id });
  const { hasPermission } = useAdminAuth();

  return (
    <DataEditor
      title={isEditMode ? "Sửa quyền / nhóm" : "Thêm quyền / nhóm"}
      backHref="/admin/permissions"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("permissions.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmDescription="Không xóa được quyền đang gán cho vai trò hoặc nhóm còn quyền con."
    >
      <label className={adminFieldLabelClassName}>
        Loại
        <select
          value={form.isGroup ? "group" : "permission"}
          disabled={isEditMode}
          onChange={(event) => updateField("isGroup", event.target.value === "group")}
          className={`${adminFieldInputClassName} disabled:bg-brand-line/30`}
        >
          <option value="permission">Quyền (kiểm tra ở API, gán cho vai trò)</option>
          <option value="group">Nhóm (chỉ để gom quyền)</option>
        </select>
      </label>

      <label className={adminFieldLabelClassName}>
        {form.isGroup ? "Mã nhóm" : "Mã quyền"}
        <input
          type="text"
          required
          disabled={isEditMode}
          placeholder={form.isGroup ? "vd. group:reports" : "vd. reports.view"}
          value={form.code}
          onChange={(event) => updateField("code", event.target.value)}
          className={`${adminFieldInputClassName} font-mono disabled:bg-brand-line/30`}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        {form.isGroup ? "Tên nhóm" : "Mô tả"}
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        {form.isGroup ? "Nhóm cha (để trống = nhóm gốc / module)" : "Thuộc nhóm"}
        <select
          required={!form.isGroup}
          value={form.parentId ?? ""}
          onChange={(event) => updateField("parentId", event.target.value === "" ? null : event.target.value)}
          className={adminFieldInputClassName}
        >
          <option value="">{form.isGroup ? "Không có (nhóm gốc)" : "— Chọn nhóm —"}</option>
          {parentOptions.map((group) => (
            <option key={group.id} value={group.id}>
              {`${"— ".repeat(group.depth)}${group.name}`}
            </option>
          ))}
        </select>
      </label>

      <label className={adminFieldLabelClassName}>
        Thứ tự hiển thị
        <input
          type="number"
          value={form.sortOrder}
          onChange={(event) => updateField("sortOrder", Number(event.target.value))}
          className={adminFieldInputClassName}
        />
      </label>

      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}
