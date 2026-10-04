"use client";

import { ActiveStatusField } from "@/components/admin/templates/ActiveStatusField";
import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";
import { PermissionTree } from "@/features/permissions";

import { useRoleEditor } from "../hooks/useRoleEditor";

type RoleEditorProps = {
  id?: string;
};

export function RoleEditor({ id }: RoleEditorProps) {
  const { hasPermission } = useAdminAuth();
  const canManagePermissions = hasPermission("roles.permissions.manage");
  const {
    form,
    updateField,
    toggleLeaves,
    permissionTree,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useRoleEditor({ id, canManagePermissions });

  return (
    <DataEditor
      title={isEditMode ? "Sửa vai trò" : "Thêm vai trò"}
      backHref="/admin/roles"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("roles.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmDescription="Không xóa được vai trò đang gán cho người dùng — hãy gỡ khỏi người dùng trước."
    >
      <div className="grid gap-4 sm:grid-cols-2">
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
          Mã vai trò
          <input
            type="text"
            required
            disabled={isEditMode}
            placeholder="vd. cashier"
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            className={`${adminFieldInputClassName} font-mono disabled:bg-brand-line/30`}
          />
        </label>
      </div>

      <div>
        <span className={adminFieldLabelClassName}>Quyền hạn</span>
        {!canManagePermissions && (
          <p className="mt-1 text-[12px] text-brand-muted">Bạn không có quyền thay đổi quyền hạn của vai trò.</p>
        )}

        <p className="mt-1 text-[12px] text-brand-muted">
          Tick một nhóm để chọn mọi quyền bên trong; vẫn có thể bỏ tick từng quyền. Quyền mới thêm vào nhóm sau này
          không tự được cấp.
        </p>

        <div className="mt-2">
          <PermissionTree
            nodes={permissionTree}
            selectedIds={form.permissionIds}
            onToggleLeaves={toggleLeaves}
            disabled={!canManagePermissions}
          />
        </div>
      </div>

      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}
