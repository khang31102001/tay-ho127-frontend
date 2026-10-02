"use client";

import type { ManagedMedia } from "@/features/media";
import { MediaPicker } from "@/components/shared/MediaPicker";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { getSiteUrl } from "@/lib/site-url";

import type { SeoMetadataFormValue } from "../types/seo-metadata.types";
import type { ManagedSeoSettings } from "../types/seo-settings.types";
import { resolveSeoPreview, type SeoEntityDefaults } from "../utils/resolve-seo-preview";
import { GoogleSearchPreview } from "./GoogleSearchPreview";
import { SocialPreview } from "./SocialPreview";
import { SeoLengthHint } from "./SeoLengthHint";

type SeoFieldsFormProps = {
  form: SeoMetadataFormValue;
  updateField: <K extends keyof SeoMetadataFormValue>(field: K, value: SeoMetadataFormValue[K]) => void;
  mediaOptions: ManagedMedia[];
  entityDefaults: SeoEntityDefaults;
  settings: ManagedSeoSettings;
  /** null = entity chưa có trang public (vd. Category hôm nay) — ẩn phần canonical/preview URL thật. */
  previewUrl: string | null;
};

/**
 * Component field SEO DÙNG CHUNG (Task 16: "Tab SEO reuse cùng component SEO
 * Editor") — render trong CẢ 2 ngữ cảnh:
 * 1. SeoEditor đứng riêng (Admin > SEO > Metadata > Sửa), bọc trong DataEditor
 *    của chính nó.
 * 2. 1 tab bên trong Product/Category/Article Editor — không tự bọc form/nút
 *    Lưu riêng, chỉ render field + preview, nơi gọi tự quyết định layout tab.
 */
export function SeoFieldsForm({
  form,
  updateField,
  mediaOptions,
  entityDefaults,
  settings,
  previewUrl,
}: SeoFieldsFormProps) {
  const mediaById = new Map(mediaOptions.map((media) => [media.id, media]));
  const resolved = resolveSeoPreview(form, entityDefaults, settings);
  const absoluteUrl = previewUrl ? `${getSiteUrl()}${previewUrl}` : null;
  const ogImage = resolved.ogImageMediaId ? mediaById.get(resolved.ogImageMediaId) ?? null : null;

  return (
    <div className="space-y-8">
      {/* ===== Basic SEO ===== */}
      <section className="space-y-4">
        <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-greenDark">Basic SEO</h3>

        <label className={adminFieldLabelClassName}>
          Meta Title
          <input
            type="text"
            value={form.metaTitle ?? ""}
            onChange={(event) => updateField("metaTitle", event.target.value || null)}
            placeholder={entityDefaults.title}
            className={adminFieldInputClassName}
          />
        </label>
        <SeoLengthHint value={form.metaTitle ?? ""} min={30} max={60} />

        <label className={adminFieldLabelClassName}>
          Meta Description
          <textarea
            value={form.metaDescription ?? ""}
            onChange={(event) => updateField("metaDescription", event.target.value || null)}
            placeholder={entityDefaults.description || settings.defaultDescription}
            rows={3}
            className={`${adminFieldInputClassName} h-auto resize-none py-2`}
          />
        </label>
        <SeoLengthHint value={form.metaDescription ?? ""} min={70} max={160} />

        <label className={adminFieldLabelClassName}>
          Canonical URL (tùy chọn — để trống sẽ tự sinh từ URL trang)
          <input
            type="text"
            value={form.canonicalUrl ?? ""}
            onChange={(event) => updateField("canonicalUrl", event.target.value || null)}
            placeholder={absoluteUrl ?? "Chưa có trang công khai cho entity này"}
            className={adminFieldInputClassName}
          />
        </label>
      </section>

      {/* ===== Search Engine ===== */}
      <section className="space-y-3 border-t border-brand-line pt-6">
        <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-greenDark">Search Engine</h3>

        <label className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
          <input
            type="checkbox"
            checked={form.robotsIndex}
            onChange={(event) => updateField("robotsIndex", event.target.checked)}
            className="size-4 accent-brand-green"
          />
          Cho phép công cụ tìm kiếm index (Index)
        </label>

        <label className="flex items-center gap-2 text-[13px] font-medium text-brand-ink">
          <input
            type="checkbox"
            checked={form.robotsFollow}
            onChange={(event) => updateField("robotsFollow", event.target.checked)}
            className="size-4 accent-brand-green"
          />
          Cho phép đi theo liên kết (Follow)
        </label>
      </section>

      {/* ===== Open Graph ===== */}
      <section className="space-y-4 border-t border-brand-line pt-6">
        <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-greenDark">Open Graph</h3>

        <label className={adminFieldLabelClassName}>
          OG Title
          <input
            type="text"
            value={form.ogTitle ?? ""}
            onChange={(event) => updateField("ogTitle", event.target.value || null)}
            placeholder={resolved.ogTitle}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          OG Description
          <textarea
            value={form.ogDescription ?? ""}
            onChange={(event) => updateField("ogDescription", event.target.value || null)}
            placeholder={resolved.ogDescription}
            rows={2}
            className={`${adminFieldInputClassName} h-auto resize-none py-2`}
          />
        </label>

        <MediaPicker
          mediaType="image"
          label="OG Image"
          mediaOptions={mediaOptions}
          selectedId={form.ogImageMediaId}
          onChange={(mediaId) => updateField("ogImageMediaId", mediaId)}
        />
      </section>

      {/* ===== Twitter ===== */}
      <section className="space-y-4 border-t border-brand-line pt-6">
        <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-greenDark">Twitter</h3>

        <label className={adminFieldLabelClassName}>
          Twitter Title
          <input
            type="text"
            value={form.twitterTitle ?? ""}
            onChange={(event) => updateField("twitterTitle", event.target.value || null)}
            placeholder={resolved.twitterTitle}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Twitter Description
          <textarea
            value={form.twitterDescription ?? ""}
            onChange={(event) => updateField("twitterDescription", event.target.value || null)}
            placeholder={resolved.twitterDescription}
            rows={2}
            className={`${adminFieldInputClassName} h-auto resize-none py-2`}
          />
        </label>

        <MediaPicker
          mediaType="image"
          label="Twitter Image"
          mediaOptions={mediaOptions}
          selectedId={form.twitterImageMediaId}
          onChange={(mediaId) => updateField("twitterImageMediaId", mediaId)}
        />
      </section>

      {/* ===== Preview ===== */}
      <section className="space-y-3 border-t border-brand-line pt-6">
        <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-greenDark">Xem trước (Preview)</h3>

        {absoluteUrl ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <GoogleSearchPreview title={resolved.title} url={absoluteUrl} description={resolved.description} />
            <SocialPreview
              imageUrl={ogImage?.url ?? null}
              title={resolved.ogTitle}
              description={resolved.ogDescription}
              url={absoluteUrl}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-brand-line bg-brand-cream/40 p-4 text-[13px] text-brand-muted">
            Entity này chưa có trang công khai trên Site nên chưa hiển thị được Preview URL thật — dữ liệu SEO vẫn được
            lưu để dùng khi có trang.
          </p>
        )}
      </section>
    </div>
  );
}
