"use client";

import Link from "next/link";
import { ListTree } from "lucide-react";

import { DataEditor } from "@/shared/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/shared/admin/templates/formFieldClassName";
import { SlugInput } from "@/shared/components/SlugInput";
import type { PublishStatus } from "@/shared/components/PublishStatusBadge";

import { usePageEditor } from "../hooks/usePageEditor";

import { AdminSelect } from "@/shared/admin/templates/AdminSelect";
type PageEditorProps = {
  id?: string;
};

export function PageEditor({ id }: PageEditorProps) {
  const {
    form,
    updateField,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = usePageEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa page" : "Thêm page"}
      backHref="/admin/content/pages"
      isLoading={isLoading}
      loadError={loadError}
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
            Đây là trang chủ (URL gốc &quot;/&quot;), không thể đổi đường dẫn.
          </span>
        </label>
      ) : (
        <SlugInput
          value={form.slug.replace(/^\//, "")}
          onChange={(segment) => updateField("slug", `/${segment}`)}
          sourceValue={form.name}
          enableAutoGenerate={!isEditMode}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Mã trang (page key)
          <input
            type="text"
            value={form.pageKey}
            onChange={(event) => updateField("pageKey", event.target.value)}
            placeholder="vd. gioi-thieu"
            className={adminFieldInputClassName}
          />
          <span className="mt-1 block text-[12px] font-normal text-brand-muted">
            Mã cố định Site dùng để tìm trang (home, gioi-thieu, thuc-don, tin-tuc, lien-he). Chữ thường, nối bằng gạch
            ngang. Đã có mã thì để trống = giữ nguyên.
          </span>
        </label>

        <label className={adminFieldLabelClassName}>
          Thứ tự
          <input
            type="number"
            value={form.sortOrder}
            onChange={(event) => updateField("sortOrder", Number(event.target.value) || 0)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Trạng thái
        <AdminSelect
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as PublishStatus)}
          className={adminFieldInputClassName}
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
          <option value="archived">Lưu trữ</option>
        </AdminSelect>
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
