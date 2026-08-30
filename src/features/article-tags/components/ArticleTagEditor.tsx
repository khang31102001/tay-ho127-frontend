"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { SlugInput } from "@/components/shared/SlugInput";

import { useArticleTagEditor } from "../hooks/useArticleTagEditor";

type ArticleTagEditorProps = {
  id?: string;
};

export function ArticleTagEditor({ id }: ArticleTagEditorProps) {
  const { form, updateField, isLoading, isEditMode, handleSave, handleDelete, goToExplore } =
    useArticleTagEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa thẻ" : "Thêm thẻ"}
      backHref="/admin/content/article-tags"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Tên thẻ
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
    </DataEditor>
  );
}
