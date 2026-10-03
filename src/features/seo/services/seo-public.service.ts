import { fetchBackend } from "@/lib/http/backend-fetch";

import type { ManagedSeoSettings } from "../types/seo-settings.types";
import { DEFAULT_SEO_SETTINGS } from "../utils/default-seo-settings";
import { toManagedSeoSettings, type SeoSettingsDto } from "../utils/seo-settings-dto";

/**
 * SEO công khai cho Customer Site — Backend GET /api/v1/seo/public/* (không cần đăng nhập).
 * SERVER-ONLY (generateMetadata, robots.ts): gọi thẳng Backend, cache 60 giây → Admin sửa
 * SEO Settings thì Site thấy trong tối đa 60 giây. Quản lý (sửa) là việc của seo-settings.service.ts.
 *
 * Backend chưa có bản ghi / lỗi / không kết nối được → DEFAULT_SEO_SETTINGS (lỗi được log):
 * metadata và robots.txt luôn dựng được, không làm vỡ trang.
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
