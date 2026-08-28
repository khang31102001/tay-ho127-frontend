"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

import { useCategoryEditor } from "../hooks/useCategoryEditor";

type CategoryEditorProps = {
  id?: string;
};

export function CategoryEditor({ id }: CategoryEditorProps) {
  const {
    form,
    updateField,
    parentOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useCategoryEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa danh mục" : "Thêm danh mục"}
      backHref="/admin/catalog/categories"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Tên danh mục
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Danh mục cha (tùy chọn)
          <select
            value={form.parentId ?? ""}
            onChange={(event) =>
              updateField("parentId", event.target.value === "" ? null : event.target.value)
            }
            className={adminFieldInputClassName}
          >
            <option value="">Không có (danh mục gốc)</option>

            {parentOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
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
