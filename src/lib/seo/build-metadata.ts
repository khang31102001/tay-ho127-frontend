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
  const canonical = `${siteUrl}${payload.path}`;
  const title = payload.title.includes(SITE_NAME) ? payload.title : `${payload.title} | ${SITE_NAME}`;
  const images = payload.image ? [{ url: payload.image }] : undefined;

  const openGraph: Metadata["openGraph"] =
    payload.type === "article"
      ? {
          type: "article",
          title,
          description: payload.description,
          url: canonical,
          siteName: SITE_NAME,
          images,
          publishedTime: payload.publishedTime ?? undefined,
          modifiedTime: payload.modifiedTime ?? undefined,
        }
      : {
          type: "website",
          title,
          description: payload.description,
          url: canonical,
          siteName: SITE_NAME,
          images,
        };

  return {
    title,
    description: payload.description,
    alternates: { canonical },
    robots: payload.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph,
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description: payload.description,
      images: payload.image ? [payload.image] : undefined,
    },
  };
}
