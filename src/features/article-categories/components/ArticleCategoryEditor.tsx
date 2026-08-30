"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { SlugInput } from "@/components/shared/SlugInput";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

import { useArticleCategoryEditor } from "../hooks/useArticleCategoryEditor";

type ArticleCategoryEditorProps = {
  id?: string;
};

export function ArticleCategoryEditor({ id }: ArticleCategoryEditorProps) {
  const {
    form,
    updateField,
    parentOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useArticleCategoryEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa danh mục bài viết" : "Thêm danh mục bài viết"}
      backHref="/admin/content/article-categories"
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

      <SlugInput
        value={form.slug}
        onChange={(value) => updateField("slug", value)}
        sourceValue={form.name}
        enableAutoGenerate={!isEditMode}
      />

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
