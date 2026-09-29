"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";
import { NAVIGATION_ICON_NAMES, resolveNavigationIcon } from "@/features/navigation";

import { useAdminMenuEditor } from "../hooks/useAdminMenuEditor";

export function AdminMenuEditor({ id }: { id?: string }) {
  const { hasPermission } = useAdminAuth();
  const canManagePermissions = hasPermission("menus.permissions.manage");
  const {
    form,
    updateField,
    togglePermissionCode,
    parentOptions,
    permissionCodeOptions,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useAdminMenuEditor({ id, canManagePermissions });

  const SelectedIcon = resolveNavigationIcon(form.icon);

  return (
    <DataEditor
      title={isEditMode ? "Sửa menu quản trị" : "Thêm menu quản trị"}
      backHref="/admin/system/menus"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode && hasPermission("menus.delete") ? handleDelete : undefined}
      onDeleted={goToExplore}
      deleteConfirmDescription="Không xóa được menu còn menu con — hãy xóa hoặc chuyển menu con trước."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Tên hiển thị
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Mã menu
          <input
            type="text"
            required
            disabled={isEditMode}
            placeholder="vd. reports.daily"
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            className={`${adminFieldInputClassName} font-mono disabled:bg-brand-line/30`}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Nhóm cha
          <select
            value={form.parentId}
            onChange={(event) => updateField("parentId", event.target.value)}
            className={adminFieldInputClassName}
          >
            <option value="">(Không — menu gốc)</option>
            {parentOptions.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
        </label>

        <label className={adminFieldLabelClassName}>
          Đường dẫn
          <input
            type="text"
            placeholder="/admin/... (để trống nếu là tiêu đề nhóm)"
            value={form.route}
            onChange={(event) => updateField("route", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Icon
          <div className="flex items-center gap-2">
            <select
              value={form.icon}
              onChange={(event) => updateField("icon", event.target.value)}
              className={adminFieldInputClassName}
            >
              <option value="">(Không có icon)</option>
              {NAVIGATION_ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {SelectedIcon && <SelectedIcon className="size-5 shrink-0 text-brand-greenDark" />}
          </div>
        </label>

        <label className={adminFieldLabelClassName}>
          Thứ tự
          <input
            type="number"
            value={form.sortOrder}
            onChange={(event) => updateField("sortOrder", Number(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div>
        <span className={adminFieldLabelClassName}>Quyền được xem</span>
        <p className="mt-1 text-[12px] text-brand-muted">
          Admin cần có ít nhất 1 quyền đã chọn mới thấy menu. Không chọn = mọi admin đều thấy.
          {!canManagePermissions && " Bạn không có quyền thay đổi mục này."}
        </p>
        <div className="mt-2 grid max-h-60 gap-1 overflow-y-auto rounded-lg border border-brand-line p-3 sm:grid-cols-2">
          {permissionCodeOptions.map((code) => (
            <label key={code} className="flex items-center gap-2 font-mono text-[12px] text-brand-ink">
              <input
                type="checkbox"
                disabled={!canManagePermissions}
                checked={form.permissionCodes.includes(code)}
                onChange={() => togglePermissionCode(code)}
                className="size-4 accent-brand-green"
              />
              {code}
            </label>
          ))}
        </div>
      </div>

      {isEditMode && (
        <label className={adminFieldLabelClassName}>
          Trạng thái
          <select
            value={form.isActive ? "active" : "inactive"}
            onChange={(event) => updateField("isActive", event.target.value === "active")}
            className={adminFieldInputClassName}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Ẩn khỏi sidebar</option>
          </select>
        </label>
      )}
    </DataEditor>
  );
}
