"use client";

import { ActiveStatusField } from "@/components/admin/templates/ActiveStatusField";
import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";

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
    togglePermission,
    permissionGroups,
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

        <div className="mt-2 space-y-3">
          {permissionGroups.map((group) => (
            <fieldset key={group.domain} className="rounded-lg border border-brand-line px-3 py-2">
              <legend className="px-1 font-mono text-[12px] font-bold text-brand-muted">{group.domain}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
                    <input
                      type="checkbox"
                      disabled={!canManagePermissions}
                      checked={form.permissionIds.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="size-4 accent-brand-green"
                    />
                    <span>
                      {permission.name}
                      <span className="ml-1 font-mono text-[11px] text-brand-muted">{permission.code}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      {isEditMode && <ActiveStatusField isActive={form.isActive} onChange={(value) => updateField("isActive", value)} />}
    </DataEditor>
  );
}
