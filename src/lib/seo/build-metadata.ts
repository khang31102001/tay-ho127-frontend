import type { Metadata } from "next";

import { site } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";

import type { SeoPayload } from "./seo.types";

const SITE_NAME = site.name;

/**
 * Dựng Metadata đầy đủ (title/description/canonical/OG/Twitter card/robots)
 * từ 1 SeoPayload chung — mọi page gọi qua đây thay vì tự viết object
 * metadata rời rạc, để nhất quán và không quên field nào (trước đây một số
 * page chỉ có title/description, thiếu canonical/OG).
 */
export function buildMetadata(payload: SeoPayload): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = payload.canonicalUrl || `${siteUrl}${payload.path}`;
  const title = payload.title.includes(SITE_NAME) ? payload.title : `${payload.title} | ${SITE_NAME}`;
  const images = payload.image ? [{ url: payload.image }] : undefined;

  const ogTitle = payload.ogTitle || title;
  const ogDescription = payload.ogDescription || payload.description;
  const twitterTitle = payload.twitterTitle || ogTitle;
  const twitterDescription = payload.twitterDescription || ogDescription;

  const openGraph: Metadata["openGraph"] =
    payload.type === "article"
      ? {
          type: "article",
          title: ogTitle,
          description: ogDescription,
          url: canonical,
          siteName: SITE_NAME,
          images,
          publishedTime: payload.publishedTime ?? undefined,
          modifiedTime: payload.modifiedTime ?? undefined,
        }
      : {
          type: "website",
          title: ogTitle,
          description: ogDescription,
          url: canonical,
          siteName: SITE_NAME,
          images,
        };

  // noindex (field cũ) luôn thắng — nhiều page (404/preview chưa publish) đã
  // dùng field này trước khi có robotsIndex/robotsFollow riêng biệt.
  const shouldIndex = payload.noindex ? false : (payload.robotsIndex ?? true);
  const shouldFollow = payload.noindex ? false : (payload.robotsFollow ?? true);

  return {
    title,
    description: payload.description,
    alternates: { canonical },
    robots: { index: shouldIndex, follow: shouldFollow },
    openGraph,
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: twitterTitle,
      description: twitterDescription,
      images: payload.image ? [payload.image] : undefined,
    },
  };
}
