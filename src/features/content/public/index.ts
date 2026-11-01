// SERVER-ONLY (gọi Backend bằng fetchBackend) — chỉ import từ Server Component/route.
export {
  getPublicTaxonomy,
  getPublishedArticleBySlug,
  listActiveBanners,
  listPublishedArticles,
  listPublishedPages,
  listPublishedPageSections,
} from "./services/public-content.service";
export type {
  PublicArticle,
  PublicArticleCategory,
  PublicArticleSummary,
  PublicArticleTag,
  PublicBanner,
  PublicPage,
  PublicPageSection,
  PublicTaxonomy,
} from "./types/public-content.types";
