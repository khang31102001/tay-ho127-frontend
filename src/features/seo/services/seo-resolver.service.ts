import type { SeoPayload } from "@/lib/seo/seo.types";
// Import thẳng service (không qua barrel @/features/media) — file này được
// gọi trực tiếp từ generateMetadata() ở app/(site)/**, barrel @/features/media
// re-export cả UI Admin (MediaExplorer/MediaEditor). Dùng public-media.service
// (đọc media public, không cần phiên Admin) như các trang Site khác.
import { listMedia } from "@/features/media/services/public-media.service";

import { EMPTY_SEO_METADATA_FORM, type SeoEntityType } from "../types/seo-metadata.types";
import { getPublicSeoMetadata, getPublicSeoSettings } from "./seo-public.service";
import { resolveSeoPreview, type SeoEntityDefaults } from "../utils/resolve-seo-preview";

export type SeoEntityContext = {
  entityType: SeoEntityType;
  entityId: string | null;
  /** Đường dẫn tương đối trang HIỆN TẠI đang gọi generateMetadata() (vd. "/thuc-don/product-bc001"). */
  path: string;
  defaults: SeoEntityDefaults & { title: string };
  /**
   * URL ảnh của entity khi Site chỉ có URL (dữ liệu public từ Backend, không có
   * media id) — dùng làm Entity Default cho og:image, sau SEO Override và trước
   * ảnh mặc định của SEO Settings.
   */
  entityImageUrl?: string | null;
  contentType?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

/**
 * SEO Resolver (Task 31) — DUY NHẤT nơi implement fallback chain SEO Override
 * -> Entity Default -> SEO Settings cho Storefront. Mỗi `generateMetadata()`
 * ở app/(site)/** chỉ cần map dữ liệu domain của mình (Product/Article/...)
 * về `SeoEntityContext` rồi gọi hàm này — KHÔNG tự viết lại fallback logic
 * (đúng constraint Task 31 "Frontend không tự implement lại fallback logic ở
 * từng page").
 *
 * Trả về `SeoPayload` để page đưa thẳng cho `buildMetadata()` như trước giờ.
 */
export async function resolveSeoPayloadForEntity(context: SeoEntityContext): Promise<SeoPayload> {
  const [override, settings, mediaList] = await Promise.all([
    getPublicSeoMetadata(context.entityType, context.entityId),
    getPublicSeoSettings(),
    listMedia(),
  ]);

  const resolved = resolveSeoPreview(override ?? EMPTY_SEO_METADATA_FORM, context.defaults, settings);

  // Khác với Admin Preview (SeoFieldsForm): ở đây phải phân biệt "chưa có
  // override nào" (robots lấy từ SEO Settings) với "override tồn tại và có
  // giá trị true/true" (robots lấy đúng giá trị đã lưu) — SeoMetadataFormValue
  // không cho phép giá trị null trung gian để tự phân biệt 2 case này.
  const robotsIndex = override ? override.robotsIndex : settings.defaultRobotsIndex;
  const robotsFollow = override ? override.robotsFollow : settings.defaultRobotsFollow;

  const mediaById = new Map(mediaList.map((media) => [media.id, media]));
  const ogImageUrl = resolved.ogImageMediaId ? mediaById.get(resolved.ogImageMediaId)?.url : undefined;
  const hasOverrideImage = Boolean(override?.ogImageMediaId);
  const image = hasOverrideImage ? ogImageUrl : (context.entityImageUrl ?? ogImageUrl);

  return {
    title: resolved.title || context.defaults.title,
    description: resolved.description,
    path: context.path,
    image,
    type: context.contentType,
    publishedTime: context.publishedTime,
    modifiedTime: context.modifiedTime,
    canonicalUrl: override?.canonicalUrl || undefined,
    robotsIndex,
    robotsFollow,
    ogTitle: resolved.ogTitle,
    ogDescription: resolved.ogDescription,
    twitterTitle: resolved.twitterTitle,
    twitterDescription: resolved.twitterDescription,
  };
}
