import type { SeoEntityType } from "../types/seo-metadata.types";

/**
 * Khoá gộp (entityType, entityId) dùng để so khớp override trong danh sách
 * ManagedSeoMetadata — "_" đại diện entityId=null (homepage). Tách riêng khỏi
 * hooks/useSeoMetadataExplorer.ts (file đó "use client") để dùng được ở cả
 * Server Component/Route file (app/sitemap.ts, app/robots.ts) lẫn Client Component.
 */
export function seoMetadataRowId(entityType: SeoEntityType, entityId: string | null): string {
  return `${entityType}:${entityId ?? "_"}`;
}
