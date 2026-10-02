import type { SeoMetadataFormValue } from "../types/seo-metadata.types";

/**
 * Dùng khi TẠO MỚI entity (Product/Category/Article): chỉ persist 1 dòng
 * seo_metadata nếu Admin thực sự nhập gì đó ở tab SEO — tránh tạo dòng override
 * rỗng làm sai lệch thống kê "Đã cấu hình SEO riêng" ở SEO Dashboard.
 */
export function isSeoFormEmpty(form: SeoMetadataFormValue): boolean {
  return (
    !form.metaTitle &&
    !form.metaDescription &&
    !form.canonicalUrl &&
    !form.ogTitle &&
    !form.ogDescription &&
    !form.ogImageMediaId &&
    !form.twitterTitle &&
    !form.twitterDescription &&
    !form.twitterImageMediaId &&
    form.robotsIndex === true &&
    form.robotsFollow === true
  );
}
