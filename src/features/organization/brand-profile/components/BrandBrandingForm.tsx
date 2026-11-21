import { MediaPicker } from "@/features/media/components/MediaPicker";
import type { ManagedMedia } from "@/features/media";

import type { BrandProfileFormValue } from "../hooks/useBrandProfileEditor";

type BrandBrandingFormProps = {
  form: BrandProfileFormValue;
  mediaOptions: ManagedMedia[];
  /** Media vừa tải lên từ popup chọn ảnh — nơi gọi thêm vào `mediaOptions`. */
  onMediaUploaded: (media: ManagedMedia[]) => void;
  updateField: <K extends keyof BrandProfileFormValue>(field: K, value: BrandProfileFormValue[K]) => void;
};

/**
 * Tái sử dụng MediaPicker (features/media) cho toàn bộ tài sản thương hiệu —
 * không tạo upload flow riêng cho Brand.
 */
export function BrandBrandingForm({ form, mediaOptions, onMediaUploaded, updateField }: BrandBrandingFormProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <MediaPicker
        mediaType="image"
        label="Logo chính"
        mediaOptions={mediaOptions}
        category="brand"
        allowUpload
        onMediaUploaded={onMediaUploaded}
        selectedId={form.logoMediaId}
        onChange={(mediaId) => updateField("logoMediaId", mediaId)}
      />
      <MediaPicker
        mediaType="image"
        label="Logo nền tối (Dark)"
        mediaOptions={mediaOptions}
        category="brand"
        allowUpload
        onMediaUploaded={onMediaUploaded}
        selectedId={form.logoDarkMediaId}
        onChange={(mediaId) => updateField("logoDarkMediaId", mediaId)}
      />
      <MediaPicker
        mediaType="image"
        label="Logo nền sáng (Light)"
        mediaOptions={mediaOptions}
        category="brand"
        allowUpload
        onMediaUploaded={onMediaUploaded}
        selectedId={form.logoLightMediaId}
        onChange={(mediaId) => updateField("logoLightMediaId", mediaId)}
      />
      <MediaPicker
        mediaType="image"
        label="Favicon"
        mediaOptions={mediaOptions}
        category="brand"
        allowUpload
        onMediaUploaded={onMediaUploaded}
        selectedId={form.faviconMediaId}
        onChange={(mediaId) => updateField("faviconMediaId", mediaId)}
      />
      <MediaPicker
        mediaType="image"
        label="Ảnh mặc định khi chia sẻ (OG Image)"
        mediaOptions={mediaOptions}
        category="brand"
        allowUpload
        onMediaUploaded={onMediaUploaded}
        selectedId={form.ogImageMediaId}
        onChange={(mediaId) => updateField("ogImageMediaId", mediaId)}
      />
    </div>
  );
}
