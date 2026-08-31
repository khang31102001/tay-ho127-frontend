import { site } from "@/data/site";

/**
 * Base URL tuyệt đối dùng cho metadataBase/canonical/sitemap/robots.
 * Set NEXT_PUBLIC_SITE_URL khi domain deploy khác site.following.web
 * (vd. domain staging) — không cần sửa code ở nơi khác.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? site.following.web;
  return configured.replace(/\/$/, "");
}
