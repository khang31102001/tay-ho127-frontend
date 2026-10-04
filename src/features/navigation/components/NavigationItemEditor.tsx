"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";
import { useAdminAuth } from "@/features/admin-auth";
import { PermissionTree } from "@/features/permissions";

import { useNavigationItemEditor } from "../hooks/useNavigationItemEditor";
import { NAVIGATION_TARGET_TYPE_OPTIONS, type NavigationScope, type NavigationTargetType } from "../types/navigation.types";
import { NAVIGATION_ICON_NAMES } from "../utils/icon-registry";
import { getNavigationPermission } from "../utils/navigation-scope";

type NavigationItemEditorProps = {
  scope: NavigationScope;
  /** Bắt buộc với scope "site"; scope "admin" tự tìm container sidebar. */
  menuId?: string;
  itemId?: string;
};

export function NavigationItemEditor({ scope, menuId, itemId }: NavigationItemEditorProps) {
  const { hasPermission } = useAdminAuth();
  const canManagePermissions = hasPermission("menus.permissions.manage");
  const {
    form,
    updateField,
    pages,
    parentOptions,
    permissionTree,
    selectedPermissionIds,
    togglePermissionLeaves,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToTree,
    treePath,
  } = useNavigationItemEditor({ scope, menuId, itemId, canManagePermissions });

  const isAdminScope = scope === "admin";
  const isLink = !form.isGroup;

  return (
    <DataEditor
      title={isEditMode ? "Sửa mục menu" : "Thêm mục menu"}
      backHref={treePath}
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToTree}
      onDelete={isEditMode && hasPermission(getNavigationPermission(scope, "delete")) ? handleDelete : undefined}
      onDeleted={goToTree}
      deleteConfirmDescription="Không xóa được mục còn mục con — hãy xóa hoặc chuyển các mục con trước."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Nhãn hiển thị (Label)
          <input
            type="text"
            required
            value={form.label}
            onChange={(event) => updateField("label", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Mã (Code) {isEditMode ? "— không đổi được" : "— để trống = tự sinh"}
          <input
            type="text"
            disabled={isEditMode}
            placeholder="vd. footer.about"
            value={form.code}
            onChange={(event) => updateField("code", event.target.value)}
            className={`${adminFieldInputClassName} font-mono disabled:bg-brand-line/30`}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Thuộc mục cha (tùy chọn, tối đa 3 cấp)
          <select
            value={form.parentId ?? ""}
            onChange={(event) => updateField("parentId", event.target.value || null)}
            className={adminFieldInputClassName}
          >
            <option value="">— Không có (mục gốc) —</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {`${"— ".repeat(option.depth)}${option.label}`}
              </option>
            ))}
          </select>
        </label>

        <label className={adminFieldLabelClassName}>
          Thứ tự hiển thị (Sort Order)
          <input
            type="number"
            value={form.sortOrder}
            onChange={(event) => updateField("sortOrder", Number(event.target.value))}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
        <input
          type="checkbox"
          checked={form.isGroup}
          onChange={(event) => updateField("isGroup", event.target.checked)}
          className="size-4 shrink-0 accent-brand-green"
        />
        Tiêu đề nhóm (không có liên kết, chỉ chứa các mục con)
      </label>

      {isLink && isAdminScope && (
        <label className={adminFieldLabelClassName}>
          Route Admin (bắt đầu bằng /, vd. /admin/users)
          <input
            type="text"
            required
            value={form.url}
            onChange={(event) => updateField("url", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      )}

      {isLink && !isAdminScope && (
        <>
          <label className={adminFieldLabelClassName}>
            Loại liên kết (Target Type)
            <select
              value={form.targetType}
              onChange={(event) => updateField("targetType", event.target.value as NavigationTargetType)}
              className={adminFieldInputClassName}
            >
              {NAVIGATION_TARGET_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {form.targetType === "page" ? (
            <label className={adminFieldLabelClassName}>
              Trang CMS (Page)
              <select
                value={form.targetId ?? ""}
                onChange={(event) => updateField("targetId", event.target.value || null)}
                className={adminFieldInputClassName}
              >
                <option value="">— Chọn trang —</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name} ({page.slug})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className={adminFieldLabelClassName}>
              URL {form.targetType === "external" ? "(bắt đầu bằng https://...)" : "(route nội bộ, vd. /thuc-don)"}
              <input
                type="text"
                required
                value={form.url}
                onChange={(event) => updateField("url", event.target.value)}
                className={adminFieldInputClassName}
              />
            </label>
          )}
        </>
      )}

      {isAdminScope && (
        <label className={adminFieldLabelClassName}>
          Icon (tùy chọn — hiển thị ở Admin Sidebar)
          <select
            value={form.icon ?? ""}
            onChange={(event) => updateField("icon", event.target.value || null)}
            className={adminFieldInputClassName}
          >
            <option value="">— Không có —</option>
            {NAVIGATION_ICON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
            className="size-4 shrink-0 accent-brand-green"
          />
          Hiển thị mục này
        </label>

        {isLink && !isAdminScope && form.targetType !== "page" && (
          <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
            <input
              type="checkbox"
              checked={form.openInNewTab}
              onChange={(event) => updateField("openInNewTab", event.target.checked)}
              className="size-4 shrink-0 accent-brand-green"
            />
            Mở tab mới
          </label>
        )}
      </div>

      {isAdminScope && (
        <div>
          <span className={adminFieldLabelClassName}>Quyền truy cập</span>
          <p className="mt-1 text-[12px] text-brand-muted">
            Admin cần ÍT NHẤT 1 quyền được chọn mới thấy mục này; không chọn quyền nào = mọi admin đều thấy.
            {!canManagePermissions && " Bạn không có quyền thay đổi mục này."}
          </p>
          <div className="mt-2">
            <PermissionTree
              nodes={permissionTree}
              selectedIds={selectedPermissionIds}
              onToggleLeaves={togglePermissionLeaves}
              disabled={!canManagePermissions}
            />
          </div>
        </div>
      )}
    </DataEditor>
  );
}
