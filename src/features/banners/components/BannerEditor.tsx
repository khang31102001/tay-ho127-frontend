"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { MediaPicker } from "@/components/shared/MediaPicker";

import { useBannerEditor } from "../hooks/useBannerEditor";
import { BANNER_PLACEMENT_OPTIONS, type BannerPlacement } from "../types/banner.types";

type BannerEditorProps = {
  id?: string;
};

export function BannerEditor({ id }: BannerEditorProps) {
  const {
    form,
    updateField,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useBannerEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa banner" : "Thêm banner"}
      backHref="/admin/content/banners"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      <label className={adminFieldLabelClassName}>
        Tên banner
        <input
          type="text"
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <MediaPicker
          label="Ảnh Desktop"
          mediaOptions={mediaOptions}
          selectedId={form.desktopMediaId}
          onChange={(mediaId) => updateField("desktopMediaId", mediaId)}
        />

        <MediaPicker
          label="Ảnh Mobile"
          mediaOptions={mediaOptions}
          selectedId={form.mobileMediaId}
          onChange={(mediaId) => updateField("mobileMediaId", mediaId)}
        />
      </div>

      <label className={adminFieldLabelClassName}>
        Alt text (mô tả ảnh, cho SEO &amp; accessibility)
        <input
          type="text"
          required
          value={form.altText}
          onChange={(event) => updateField("altText", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Heading (tùy chọn)
          <input
            type="text"
            value={form.heading}
            onChange={(event) => updateField("heading", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Subheading (tùy chọn)
          <input
            type="text"
            value={form.subheading}
            onChange={(event) => updateField("subheading", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          CTA Label (tùy chọn)
          <input
            type="text"
            value={form.ctaLabel}
            onChange={(event) => updateField("ctaLabel", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          CTA URL (tùy chọn)
          <input
            type="text"
            value={form.ctaUrl}
            onChange={(event) => updateField("ctaUrl", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <label className={adminFieldLabelClassName}>
        Vị trí hiển thị (Placement)
        <select
          value={form.placement}
          onChange={(event) => updateField("placement", event.target.value as BannerPlacement)}
          className={adminFieldInputClassName}
        >
          {BANNER_PLACEMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

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

      <label className="flex items-center gap-2.5 text-[13px] font-bold text-brand-greenDark">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => updateField("isActive", event.target.checked)}
          className="size-4 shrink-0 accent-brand-green"
        />
        Bật banner này (hiển thị trên Site nếu trong thời gian chạy)
      </label>
    </DataEditor>
  );
}
