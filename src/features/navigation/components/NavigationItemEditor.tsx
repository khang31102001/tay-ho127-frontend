"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";

import { useNavigationItemEditor } from "../hooks/useNavigationItemEditor";
import { NAVIGATION_TARGET_TYPE_OPTIONS, type NavigationTargetType } from "../types/navigation.types";
import { NAVIGATION_ICON_NAMES } from "../utils/icon-registry";

type NavigationItemEditorProps = {
  menuId: string;
  itemId?: string;
};

export function NavigationItemEditor({ menuId, itemId }: NavigationItemEditorProps) {
  const { form, updateField, pages, parentOptions, isLoading, isEditMode, handleSave, handleDelete, goToTree } =
    useNavigationItemEditor({ menuId, itemId });

  return (
    <DataEditor
      title={isEditMode ? "Sửa mục menu" : "Thêm mục menu"}
      backHref={`/admin/settings/navigation/${menuId}/items`}
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToTree}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToTree}
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
          Thuộc mục cha (tùy chọn)
          <select
            value={form.parentId ?? ""}
            onChange={(event) => updateField("parentId", event.target.value || null)}
            className={adminFieldInputClassName}
          >
            <option value="">— Không có (mục gốc) —</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Icon (tùy chọn — chỉ áp dụng khi hiển thị ở Admin Sidebar)
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

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(event) => updateField("isVisible", event.target.checked)}
            className="size-4 shrink-0 accent-brand-green"
          />
          Hiển thị mục này
        </label>

        {form.targetType !== "page" && (
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
    </DataEditor>
  );
}
