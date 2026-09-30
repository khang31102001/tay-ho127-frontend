"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import { useMenuEditor } from "../hooks/useMenuEditor";

type MenuEditorProps = {
  id?: string;
};

export function MenuEditor({ id }: MenuEditorProps) {
  const {
    form,
    updateField,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useMenuEditor({ id });
  const { hasPermission } = useAdminAuth();

  return (
    <DataEditor
      title={isEditMode ? "Sửa thực đơn" : "Thêm thực đơn"}
      backHref="/admin/catalog/menus"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("sales-menus.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmDescription="Mọi liên kết Menu-SP của thực đơn này cũng bị xóa. Hành động này không thể hoàn tác."
    >
      <label className={adminFieldLabelClassName}>
        Tên thực đơn
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        Mã thực đơn {isEditMode && <span className="font-normal text-brand-muted">(không đổi được sau khi tạo)</span>}
        <input
          type="text"
          required
          disabled={isEditMode}
          value={form.code}
          onChange={(event) => updateField("code", event.target.value.trim().toLowerCase())}
          placeholder="vd. thuc-don-cuoi-tuan"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={64}
          title="Chữ thường không dấu, số và dấu gạch ngang"
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
