"use client";

import { DataEditor } from "@/shared/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/shared/admin/templates/formFieldClassName";
import { MediaMultiPicker, MediaPicker } from "@/features/media/components/MediaPicker";

import { usePageSectionEditor } from "../hooks/usePageSectionEditor";
import { SECTION_TYPE_OPTIONS, type SectionType } from "../types/page-section.types";

import { AdminSelect } from "@/shared/admin/templates/AdminSelect";
const hintClassName = "mt-1 block text-[12px] font-normal text-brand-muted";

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
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = usePageSectionEditor({ pageId, id });
  const isStory = form.sectionType === "story";
  const isAward = form.sectionType === "award";

  return (
    <DataEditor
      title={isEditMode ? "Sửa section" : "Thêm section"}
      backHref={`/admin/content/pages/${pageId}/sections`}
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Loại section
        <AdminSelect
          value={form.sectionType}
          onChange={(event) => updateField("sectionType", event.target.value as SectionType)}
          className={adminFieldInputClassName}
        >
          {SECTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
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
        {isStory && <span className={hintClassName}>Phần tiêu đề màu đỏ, vd. &quot;Hơn 6 thập kỷ&quot;.</span>}
        {isAward && <span className={hintClassName}>Tiêu đề in nghiêng màu xanh dưới logo. Bỏ trống thì không hiện.</span>}
      </label>

      <label className={adminFieldLabelClassName}>
        Subheading (tùy chọn)
        <input
          type="text"
          value={form.subheading ?? ""}
          onChange={(event) => updateField("subheading", event.target.value)}
          className={adminFieldInputClassName}
        />
        {isStory && <span className={hintClassName}>Phần tiêu đề màu xanh nối tiếp, vd. &quot;gìn giữ vị xưa&quot;.</span>}
      </label>

      <label className={adminFieldLabelClassName}>
        Nội dung (tùy chọn)
        <textarea
          value={form.body ?? ""}
          onChange={(event) => updateField("body", event.target.value)}
          rows={isStory ? 10 : 4}
          className={`${adminFieldInputClassName} h-auto resize-none py-2`}
        />
        {isStory && <span className={hintClassName}>Mỗi đoạn văn cách nhau bằng một dòng trống.</span>}
        {isAward && (
          <span className={hintClassName}>Đoạn mô tả ngắn — trang chủ chỉ hiện tối đa 3–4 dòng.</span>
        )}
      </label>

      <MediaPicker
        mediaType="image"
        label={
          isStory
            ? "Ảnh chính — ảnh dọc bên phải (tùy chọn)"
            : isAward
              ? "Ảnh lớn bên trái, vd. bìa sách MICHELIN (tùy chọn, ẩn trên điện thoại)"
              : "Ảnh minh họa (tùy chọn)"
        }
        mediaOptions={mediaOptions}
        selectedId={form.mediaId ?? null}
        onChange={(mediaId) => updateField("mediaId", mediaId)}
      />

      {isStory && (
        <div>
          <MediaMultiPicker
            label="Ảnh phụ — 2 ảnh cột trái, theo thứ tự trên → dưới (tùy chọn)"
            mediaType="image"
            mediaOptions={mediaOptions}
            selectedIds={form.galleryMediaIds}
            onChange={(mediaIds) => updateField("galleryMediaIds", mediaIds)}
          />
          <span className={hintClassName}>
            Bỏ trống ảnh nào thì trang chủ dùng ảnh mặc định ở vị trí đó. Ảnh dưới chỉ hiện từ màn hình tablet trở lên.
          </span>
        </div>
      )}

      {isAward && (
        <div>
          <MediaPicker
            mediaType="image"
            label="Logo nhỏ phía trên tiêu đề, vd. logo MICHELIN 2026 (tùy chọn)"
            mediaOptions={mediaOptions}
            selectedId={form.galleryMediaIds[0] ?? null}
            onChange={(mediaId) => updateField("galleryMediaIds", mediaId ? [mediaId] : [])}
          />
          <span className={hintClassName}>Bỏ trống ảnh nào thì trang chủ dùng ảnh mặc định ở vị trí đó.</span>
        </div>
      )}

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
