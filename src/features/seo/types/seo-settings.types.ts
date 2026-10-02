/**
 * Global SEO fallback — CHỈ chứa field thực sự SEO-specific. KHÔNG chứa
 * site_name/organization_name/logo/phone/email/address/social vì các field
 * đó đã tồn tại 1:1 trên `features/brand` (ManagedBrandSettings/SocialLink) —
 * Organization/LocalBusiness/Restaurant schema (khi triển khai Phase Schema)
 * phải đọc thẳng từ brand_settings, không lưu bản sao ở đây. Xem
 * seo-architecture-analysis.md mục 8.1 (đã được xác nhận thu gọn).
 */
export type ManagedSeoSettings = {
  /** Singleton — luôn là "seo-settings", chỉ có get/update, không có create/delete. */
  id: string;
  /** Chuỗi có "%s" làm placeholder cho title của từng entity/page. */
  defaultTitleTemplate: string;
  defaultDescription: string;
  /** Tham chiếu ManagedMedia.id, chọn từ Media Library. */
  defaultOgImageMediaId: string | null;
  twitterSite: string | null;
  twitterCreator: string | null;
  defaultRobotsIndex: boolean;
  defaultRobotsFollow: boolean;
  /**
   * robots.txt (Task 27) — danh sách path bắt đầu bằng "/" không nên bị công
   * cụ tìm kiếm crawl (route giao dịch/cá nhân hoá, khu vực quản trị...).
   * Đây là mức site-wide (robots.txt disallow), KHÁC với defaultRobotsIndex/
   * defaultRobotsFollow ở trên (meta robots per-page, index/follow từng trang).
   */
  robotsDisallowPaths: string[];
  updatedAt: string;
};

export type SeoSettingsFormValue = Omit<ManagedSeoSettings, "id" | "updatedAt">;
