import { adminApi } from "@/lib/http/admin-api";
import { isApiError } from "@/lib/http/api-error";

import type { ManagedSeoSettings, SeoSettingsFormValue } from "../types/seo-settings.types";
import { DEFAULT_SEO_SETTINGS } from "../utils/default-seo-settings";
import { toManagedSeoSettings, toSeoSettingsRequest, type SeoSettingsDto } from "../utils/seo-settings-dto";

/**
 * Admin → SEO → Cài đặt SEO, gọi Backend /api/v1/seo/settings (quyền seo-settings.view|update).
 * Singleton: chỉ có get/update. Site đọc cùng dữ liệu này qua seo-public.service.ts (server-only).
 *
 * - `defaultTitleTemplate` phải chứa "%s"; mỗi `robotsDisallowPaths` phải bắt đầu bằng một "/" — Backend trả 400 nếu sai.
 * - Backend chưa có bản ghi (chưa chạy `seed`) → trả giá trị mặc định để form vẫn mở được; bấm Lưu sẽ tạo bản ghi.
 */
export async function getSeoSettings(): Promise<ManagedSeoSettings> {
  try {
    return toManagedSeoSettings(await adminApi.get<SeoSettingsDto>("/seo/settings"));
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return DEFAULT_SEO_SETTINGS;
    }
    throw error;
  }
}

export async function updateSeoSettings(input: SeoSettingsFormValue): Promise<ManagedSeoSettings> {
  return toManagedSeoSettings(await adminApi.put<SeoSettingsDto>("/seo/settings", toSeoSettingsRequest(input)));
}
