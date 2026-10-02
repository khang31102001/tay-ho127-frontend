import type { SeoMetadataFormValue } from "../types/seo-metadata.types";
import type { ManagedSeoSettings } from "../types/seo-settings.types";

/**
 * Dữ liệu mặc định lấy từ chính entity (Task 4 — Entity Default), do nơi gọi
 * tự map (Product.name/description/mediaIds[0], Article.title/summary/
 * featuredMediaId, ...). Không tự đoán field ở đây.
 */
export type SeoEntityDefaults = {
  title: string;
  description: string;
  imageMediaId: string | null;
};

export type ResolvedSeoPreview = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImageMediaId: string | null;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageMediaId: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
};

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return "";
}

/**
 * Fallback chain Task 4: SEO Override -> Entity Default -> Global SEO Settings.
 * Đây là bản resolve DÙNG CHO ADMIN PREVIEW (Google/Social Preview trong SEO
 * Editor) — chưa phải Storefront generateMetadata() thật (Phase 5, chưa triển
 * khai trong lần này), nhưng cùng 1 thứ tự fallback để nhất quán khi tích hợp sau.
 */
export function resolveSeoPreview(
  form: SeoMetadataFormValue,
  entityDefaults: SeoEntityDefaults,
  settings: ManagedSeoSettings,
): ResolvedSeoPreview {
  const title = firstNonEmpty(form.metaTitle, entityDefaults.title);
  const description = firstNonEmpty(form.metaDescription, entityDefaults.description, settings.defaultDescription);
  const ogImageMediaId = form.ogImageMediaId ?? entityDefaults.imageMediaId ?? settings.defaultOgImageMediaId;

  const ogTitle = firstNonEmpty(form.ogTitle, title);
  const ogDescription = firstNonEmpty(form.ogDescription, description);

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImageMediaId,
    twitterTitle: firstNonEmpty(form.twitterTitle, ogTitle),
    twitterDescription: firstNonEmpty(form.twitterDescription, ogDescription),
    twitterImageMediaId: form.twitterImageMediaId ?? ogImageMediaId,
    robotsIndex: form.robotsIndex,
    robotsFollow: form.robotsFollow,
  };
}
