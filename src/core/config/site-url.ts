import { site } from "@/core/config/site-data";

/**
 * Base URL tuyệt đối dùng cho metadataBase/canonical/sitemap/robots.
 * Set NEXT_PUBLIC_SITE_URL khi domain deploy khác site.following.web
 * (vd. domain staging) — không cần sửa code ở nơi khác.
 */
export function getSiteUrl(): string {
  // `||` (không phải `??`): build-arg rỗng trong Docker/CI vẫn phải rơi về domain mặc định, nếu không `new URL("")` làm build chết.
  const configured = process.env.NEXT_PUBLIC_SITE_URL || site.following.web;
  return configured.replace(/\/$/, "");
}
