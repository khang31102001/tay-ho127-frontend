// SERVER-ONLY (gọi Backend bằng fetchBackend) — chỉ import từ Server Component/route.
export {
  getPublicTaxonomy,
  getPublishedArticleBySlug,
  listActiveBanners,
  listPublishedArticles,
  listPublishedPages,
  listPublishedPageSections,
} from "./services/public-content.service";
export {
  listPageSlots,
  loadMediaById,
  loadSlotContents,
  orderBlockKeys,
  resolveImage,
  splitLines,
  splitParagraphs,
  toCta,
  type PageSlot,
  type SlotContent,
  type SlotImage,
  type SlotLink,
} from "./services/page-slot.service";
export type {
  PublicArticle,
  PublicArticleCategory,
  PublicArticleSummary,
  PublicArticleTag,
  PublicBanner,
  PublicPage,
  PublicPageSection,
  PublicPageSectionItem,
  PublicTaxonomy,
} from "./types/public-content.types";
