"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { MediaPicker } from "@/components/shared/MediaPicker";

import { usePageSectionEditor } from "../hooks/usePageSectionEditor";
import { SECTION_TYPE_OPTIONS, type SectionType } from "../types/page-section.types";

type PageSectionEditorProps = {
  pageId: string;
  id?: string;
};

export function PageSectionEditor({ pageId, id }: PageSectionEditorProps) {
  const {
    form,
    updateField,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = usePageSectionEditor({ pageId, id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa section" : "Thêm section"}
      backHref={`/admin/content/pages/${pageId}/sections`}
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Loại section
        <select
          value={form.sectionType}
          onChange={(event) => updateField("sectionType", event.target.value as SectionType)}
          className={adminFieldInputClassName}
        >
          {SECTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className={adminFieldLabelClassName}>
        Eyebrow (nhãn nhỏ, tùy chọn)
        <input
          type="text"
          value={form.eyebrow ?? ""}
          onChange={(event) => updateField("eyebrow", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        Heading
        <input
          type="text"
          value={form.heading ?? ""}
          onChange={(event) => updateField("heading", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        Subheading (tùy chọn)
        <input
          type="text"
          value={form.subheading ?? ""}
          onChange={(event) => updateField("subheading", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <label className={adminFieldLabelClassName}>
        Nội dung (tùy chọn)
        <textarea
          value={form.body ?? ""}
          onChange={(event) => updateField("body", event.target.value)}
          rows={4}
          className={`${adminFieldInputClassName} h-auto resize-none py-2`}
        />
      </label>

      <MediaPicker
        label="Ảnh minh họa (tùy chọn)"
        mediaOptions={mediaOptions}
        selectedId={form.mediaId ?? null}
        onChange={(mediaId) => updateField("mediaId", mediaId)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          CTA Label (tùy chọn)
          <input
            type="text"
            value={form.ctaLabel ?? ""}
            onChange={(event) => updateField("ctaLabel", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          CTA URL (tùy chọn)
          <input
            type="text"
            value={form.ctaUrl ?? ""}
            onChange={(event) => updateField("ctaUrl", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
        <input
          type="checkbox"
          checked={form.isVisible}
          onChange={(event) => updateField("isVisible", event.target.checked)}
          className="size-4 shrink-0 accent-brand-green"
        />
        Hiển thị section này trên Site
      </label>
    </DataEditor>
  );
}
