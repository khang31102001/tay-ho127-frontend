"use client";

import { AdminCollapsibleSection } from "@/shared/admin/templates/AdminCollapsibleSection";
import { DataEditor } from "@/shared/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/shared/admin/templates/formFieldClassName";
import { MediaPicker } from "@/features/media/components/MediaPicker";

import { useBannerEditor, type BannerFormValue } from "../hooks/useBannerEditor";
import { BannerSectionPicker } from "./BannerSectionPicker";

type BannerEditorProps = {
  id?: string;
};

const MAX_VISIBLE_PLACEMENT_CHIPS = 2;

function formatDate(dateInputValue: string) {
  return new Date(dateInputValue).toLocaleDateString("vi-VN");
}

/** Tóm tắt từng khối — hiện ngay trên tiêu đề khối để khỏi phải mở ra mới biết nội dung. */
function summarizeImages(form: BannerFormValue) {
  if (!form.desktopMediaId) return { warning: "Chưa chọn ảnh desktop", summary: null };
  return { warning: null, summary: form.mobileMediaId ? "Ảnh desktop + mobile" : "Ảnh desktop (chưa có ảnh mobile)" };
}

function summarizeText(form: BannerFormValue) {
  const parts = [
    form.heading ? `Tiêu đề: ${form.heading}` : null,
    form.ctaLabel ? `Nút “${form.ctaLabel}”${form.ctaUrl ? ` → ${form.ctaUrl}` : ""}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Không có chữ và nút — chỉ hiện ảnh";
}

function summarizePlacement(form: BannerFormValue) {
  if (form.sections.length === 0) return { warning: "Chưa chọn vị trí — banner chưa hiện ở đâu", summary: null };

  const shown = form.sections.slice(0, MAX_VISIBLE_PLACEMENT_CHIPS).map((section) => `${section.pageName} › ${section.sectionLabel}`);
  const rest = form.sections.length - shown.length;
  return { warning: null, summary: `${shown.join(", ")}${rest > 0 ? ` +${rest}` : ""}` };
}

function summarizeSchedule(form: BannerFormValue) {
  const range =
    form.startAt || form.endAt
      ? `${form.startAt ? formatDate(form.startAt) : "…"} → ${form.endAt ? formatDate(form.endAt) : "…"}`
      : "Không giới hạn thời gian";
  return `${range} · Thứ tự ${form.displayOrder}`;
}

/**
 * Form banner gọn: tên + bật/tắt luôn thấy; phần còn lại chia 4 khối thu/mở, mỗi khối có dòng tóm tắt. Banner mới mở sẵn khối
 * Hình ảnh và Hiển thị ở; sửa banner có sẵn chỉ mở khối Hình ảnh.
 */
export function BannerEditor({ id }: BannerEditorProps) {
  const {
    form,
    updateField,
    mediaOptions,
    addUploadedMedia,
    isLoading,
    loadError,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useBannerEditor({ id });

  const images = summarizeImages(form);
  const placement = summarizePlacement(form);

  return (
    <DataEditor
      title={isEditMode ? "Sửa banner" : "Thêm banner"}
      backHref="/admin/content/banners"
      isLoading={isLoading}
      loadError={loadError}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <div className="flex flex-wrap items-end gap-4">
        <label className={`${adminFieldLabelClassName} min-w-[240px] flex-1`}>
          Tên banner
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className="flex h-admin-control items-center gap-2.5 text-admin-sm font-bold text-admin-text">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
            className="size-4 shrink-0 accent-admin-primary"
          />
          Đang bật
        </label>
      </div>

      <AdminCollapsibleSection title="1. Hình ảnh" summary={images.summary} warning={images.warning} defaultOpen>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaPicker
            mediaType="image"
            label="Ảnh desktop"
            mediaOptions={mediaOptions}
            category="banners"
            allowUpload
            onMediaUploaded={addUploadedMedia}
            selectedId={form.desktopMediaId}
            onChange={(mediaId) => updateField("desktopMediaId", mediaId)}
          />

          <MediaPicker
            mediaType="image"
            label="Ảnh mobile (tùy chọn)"
            mediaOptions={mediaOptions}
            category="banners"
            allowUpload
            onMediaUploaded={addUploadedMedia}
            selectedId={form.mobileMediaId}
            onChange={(mediaId) => updateField("mobileMediaId", mediaId)}
          />
        </div>

        <label className={adminFieldLabelClassName}>
          Mô tả ảnh (alt, cho SEO và người dùng trình đọc màn hình)
          <input
            type="text"
            required
            value={form.altText}
            onChange={(event) => updateField("altText", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection title="2. Chữ và nút bấm" summary={summarizeText(form)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={adminFieldLabelClassName}>
            Tiêu đề (tùy chọn)
            <input
              type="text"
              value={form.heading}
              onChange={(event) => updateField("heading", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>

          <label className={adminFieldLabelClassName}>
            Dòng phụ (tùy chọn)
            <input
              type="text"
              value={form.subheading}
              onChange={(event) => updateField("subheading", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>

          <label className={adminFieldLabelClassName}>
            Chữ trên nút (tùy chọn)
            <input
              type="text"
              value={form.ctaLabel}
              onChange={(event) => updateField("ctaLabel", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>

          <label className={adminFieldLabelClassName}>
            Link của nút (tùy chọn)
            <input
              type="text"
              placeholder="/thuc-don hoặc https://..."
              value={form.ctaUrl}
              onChange={(event) => updateField("ctaUrl", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="3. Hiển thị ở"
        summary={placement.summary}
        warning={placement.warning}
        defaultOpen={!isEditMode}
      >
        <BannerSectionPicker selected={form.sections} onChange={(sections) => updateField("sections", sections)} />
      </AdminCollapsibleSection>

      <AdminCollapsibleSection title="4. Lịch chạy và thứ tự" summary={summarizeSchedule(form)}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={adminFieldLabelClassName}>
            Bắt đầu (tùy chọn)
            <input
              type="date"
              value={form.startAt}
              onChange={(event) => updateField("startAt", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>

          <label className={adminFieldLabelClassName}>
            Kết thúc (tùy chọn)
            <input
              type="date"
              value={form.endAt}
              onChange={(event) => updateField("endAt", event.target.value)}
              className={adminFieldInputClassName}
            />
          </label>

          <label className={adminFieldLabelClassName}>
            Thứ tự hiển thị
            <input
              type="number"
              value={form.displayOrder}
              onChange={(event) => updateField("displayOrder", Number(event.target.value))}
              className={adminFieldInputClassName}
            />
          </label>
        </div>
      </AdminCollapsibleSection>
    </DataEditor>
  );
}
