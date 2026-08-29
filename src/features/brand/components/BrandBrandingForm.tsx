import { MediaPicker } from "@/components/shared/MediaPicker";
import type { ManagedMedia } from "@/features/media";

import type { BrandSettingsFormValue } from "../hooks/useBrandSettingsEditor";

type BrandBrandingFormProps = {
  form: BrandSettingsFormValue;
  mediaOptions: ManagedMedia[];
  updateField: <K extends keyof BrandSettingsFormValue>(field: K, value: BrandSettingsFormValue[K]) => void;
};

/**
 * Tái sử dụng MediaPicker (features/media) cho toàn bộ tài sản thương hiệu —
 * không tạo upload flow riêng cho Brand.
 */
export function BrandBrandingForm({ form, mediaOptions, updateField }: BrandBrandingFormProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <MediaPicker
        label="Logo chính"
        mediaOptions={mediaOptions}
        selectedId={form.logoMediaId}
        onChange={(mediaId) => updateField("logoMediaId", mediaId)}
      />
      <MediaPicker
        label="Logo nền tối (Dark)"
        mediaOptions={mediaOptions}
        selectedId={form.logoDarkMediaId}
        onChange={(mediaId) => updateField("logoDarkMediaId", mediaId)}
      />
      <MediaPicker
        label="Logo nền sáng (Light)"
        mediaOptions={mediaOptions}
        selectedId={form.logoLightMediaId}
        onChange={(mediaId) => updateField("logoLightMediaId", mediaId)}
      />
      <MediaPicker
        label="Favicon"
        mediaOptions={mediaOptions}
        selectedId={form.faviconMediaId}
        onChange={(mediaId) => updateField("faviconMediaId", mediaId)}
      />
      <MediaPicker
        label="Ảnh mặc định khi chia sẻ (OG Image)"
        mediaOptions={mediaOptions}
        selectedId={form.ogImageMediaId}
        onChange={(mediaId) => updateField("ogImageMediaId", mediaId)}
      />
    </div>
  );
}
