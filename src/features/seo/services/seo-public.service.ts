import { fetchBackend } from "@/lib/http/backend-fetch";

import type { ManagedSeoMetadata, SeoEntityType } from "../types/seo-metadata.types";
import type { ManagedSeoSettings } from "../types/seo-settings.types";
import { DEFAULT_SEO_SETTINGS } from "../utils/default-seo-settings";
import { toManagedSeoSettings, type SeoSettingsDto } from "../utils/seo-settings-dto";

/**
 * SEO công khai cho Customer Site — Backend GET /api/v1/seo/public/* (không cần đăng nhập).
 * SERVER-ONLY (generateMetadata, robots.ts, sitemap.ts): gọi thẳng Backend, cache 60 giây → Admin sửa
 * SEO thì Site thấy trong tối đa 60 giây. Quản lý (sửa) là việc của seo-settings.service.ts / seo-metadata.service.ts.
 *
 * Backend chưa có dữ liệu / lỗi / không kết nối được → giá trị mặc định (lỗi được log): SEO Settings về
 * DEFAULT_SEO_SETTINGS, override về "không có", noindex về rỗng — metadata, robots.txt và sitemap luôn dựng
 * được, không làm vỡ trang.
 */
const PUBLIC_SEO_REVALIDATE_SECONDS = 60;

export async function getPublicSeoSettings(): Promise<ManagedSeoSettings> {
  try {
    const response = await fetchBackend("/seo/public/settings", { next: { revalidate: PUBLIC_SEO_REVALIDATE_SECONDS } });

    if (response.status === 404) {
      return DEFAULT_SEO_SETTINGS;
    }

    if (!response.ok) {
      throw new Error(`Public SEO settings: HTTP ${response.status}`);
    }

    return toManagedSeoSettings((await response.json()) as SeoSettingsDto);
  } catch (error) {
    console.error("Không tải được cài đặt SEO từ Backend — dùng giá trị mặc định:", error);
    return DEFAULT_SEO_SETTINGS;
  }
}

/** Override SEO của 1 entity (entityId = null cho "homepage"); null khi entity chưa có override. */
export async function getPublicSeoMetadata(
  entityType: SeoEntityType,
  entityId: string | null,
): Promise<ManagedSeoMetadata | null> {
  try {
    const query = new URLSearchParams({ entityType });
    if (entityId !== null) {
      query.set("entityId", entityId);
    }

    const response = await fetchBackend(`/seo/public/metadata?${query}`, {
      next: { revalidate: PUBLIC_SEO_REVALIDATE_SECONDS },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Public SEO metadata: HTTP ${response.status}`);
    }

    return (await response.json()) as ManagedSeoMetadata;
  } catch (error) {
    console.error("Không tải được SEO metadata từ Backend — dùng giá trị mặc định của entity:", error);
    return null;
  }
}

/** Các entity bị đặt noindex — sitemap bỏ qua chúng. */
export type NoIndexEntity = { entityType: SeoEntityType; entityId: string | null };

export async function listPublicNoIndexEntities(): Promise<NoIndexEntity[]> {
  try {
    const response = await fetchBackend("/seo/public/noindex", { next: { revalidate: PUBLIC_SEO_REVALIDATE_SECONDS } });

    if (!response.ok) {
      throw new Error(`Public SEO noindex: HTTP ${response.status}`);
    }

    return (await response.json()) as NoIndexEntity[];
  } catch (error) {
    console.error("Không tải được danh sách noindex từ Backend — sitemap giữ mọi trang:", error);
    return [];
  }
}
