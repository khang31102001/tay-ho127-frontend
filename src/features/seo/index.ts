// UI dùng trong Admin routes (app/admin/(dashboard)/seo/**).
export { SeoDashboard } from "./components/SeoDashboard";
export { SeoMetadataExplorer } from "./components/SeoMetadataExplorer";
export { SeoEditor } from "./components/SeoEditor";
export { SeoSettingsForm } from "./components/SeoSettingsForm";

// Reuse trong Product/Category/Article Editor (tab "SEO" — Task 16).
export { SeoFieldsForm } from "./components/SeoFieldsForm";
export { useSeoMetadataForm } from "./hooks/useSeoMetadataForm";
export { getSeoSettings } from "./services/seo-settings.service";
/**
 * Chỉ dùng trực tiếp khi TẠO MỚI entity: hook useSeoMetadataForm không gọi
 * service lúc entityId=undefined (entity chưa tồn tại) — sau khi entity được
 * tạo xong và có id thật, gọi hàm này 1 lần để persist SEO form đã nhập (nếu
 * có) cho đúng entity vừa tạo. Khi SỬA entity đã tồn tại, dùng seo.save() của
 * chính hook thay vì gọi hàm này trực tiếp.
 */
export { upsertSeoMetadata } from "./services/seo-metadata.service";
export { isSeoFormEmpty } from "./utils/is-seo-form-empty";

/**
 * KHÔNG export resolveSeoPayloadForEntity/resolveGlobalSchemas/
 * resolveProductPageSchemas/resolveArticlePageSchemas/listSeoMetadata/
 * seoMetadataRowId ở đây dù các hàm này thuộc feature SEO — chúng được gọi
 * trực tiếp từ generateMetadata()/page/layout/sitemap/robots trong
 * app/(site)/** và app/sitemap.ts, app/robots.ts. Barrel này re-export cả UI
 * Admin ("use client": SeoDashboard/SeoEditor/...), import qua barrel ở
 * Storefront/Route file sẽ kéo UI Admin vào bundle Site — cùng lý do đã áp
 * dụng cho @/features/articles, @/features/media, @/features/brand (xem
 * comment tại nơi gọi, vd. app/(site)/bai-viet/page.tsx). Import thẳng:
 *   @/features/seo/services/seo-resolver.service
 *   @/features/seo/services/seo-schema-resolver.service
 *   @/features/seo/services/seo-metadata.service
 *   @/features/seo/utils/seo-metadata-key
 */

// Reuse trong ProductEditor (section "Structured Data" — Task 13/16).
export { useSeoSchemaForm } from "./hooks/useSeoSchemaForm";
export { StructuredDataSection } from "./components/StructuredDataSection";
export { buildProductSchema } from "./utils/schema-generators";

export type { SeoEntityType, ManagedSeoMetadata, SeoMetadataFormValue } from "./types/seo-metadata.types";
export type { ManagedSeoSettings } from "./types/seo-settings.types";
export type { SeoEntityDefaults } from "./utils/resolve-seo-preview";
export type { ManagedSeoSchema, SeoSchemaFormValue, SeoSchemaType } from "./types/seo-schema.types";
