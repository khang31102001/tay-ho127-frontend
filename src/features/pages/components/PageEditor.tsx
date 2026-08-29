"use client";

import Link from "next/link";
import { ListTree } from "lucide-react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { SlugInput } from "@/components/shared/SlugInput";
import type { PublishStatus } from "@/components/shared/PublishStatusBadge";

import { usePageEditor } from "../hooks/usePageEditor";

type PageEditorProps = {
  id?: string;
};

export function PageEditor({ id }: PageEditorProps) {
  const {
    form,
    updateField,
    isLoading,
    isEditMode,
    isSlugAvailable,
    handleSave,
    handleDelete,
    goToExplore,
  } = usePageEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa page" : "Thêm page"}
      backHref="/admin/content/pages"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Tên page
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      {form.slug === "/" ? (
        <label className={adminFieldLabelClassName}>
          Đường dẫn (slug)
          <input
            type="text"
            value="/"
            disabled
            className={`${adminFieldInputClassName} cursor-not-allowed bg-brand-cream/60`}
          />
          <span className="mt-1.5 block text-[12px] text-brand-muted">
            Đây là trang chủ (URL gốc "/"), không thể đổi đường dẫn.
          </span>
        </label>
      ) : (
        <SlugInput
          value={form.slug.replace(/^\//, "")}
          onChange={(segment) => updateField("slug", `/${segment}`)}
          sourceValue={form.name}
          enableAutoGenerate={!isEditMode}
          isAvailable={isSlugAvailable}
        />
      )}

      <label className={adminFieldLabelClassName}>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as PublishStatus)}
          className={adminFieldInputClassName}
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </label>

      {isEditMode && id && (
        <Link
          href={`/admin/content/pages/${id}/sections`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-green transition hover:underline"
        >
          <ListTree className="size-4" />
          Quản lý Section của page này
        </Link>
      )}
    </DataEditor>
  );
}
