// Import thẳng service của features/media (không qua barrel) — barrel của feature
// Admin re-export cả Explorer/Editor UI, import qua đó sẽ kéo UI admin vào bundle Site.
import { getPublicTaxonomy, getPublishedArticleBySlug, listPublishedArticles } from "@/features/content/public";
import type { PublicArticleSummary, PublicArticleTag, PublicTaxonomy } from "@/features/content/public";
import { listMedia } from "@/features/media/services/public-media.service";
import type { ManagedMedia } from "@/features/media/types/media.types";

import type {
  AdjacentNewsArticles,
  NewsArticleSummaryView,
  NewsArticleView,
  NewsCategoryOption,
} from "../types/news.types";

type LookupMaps = {
  mediaById: Map<string, ManagedMedia>;
  taxonomy: PublicTaxonomy;
};

async function loadLookupMaps(): Promise<LookupMaps> {
  const [mediaList, taxonomy] = await Promise.all([listMedia(), getPublicTaxonomy()]);

  return {
    mediaById: new Map(mediaList.map((media) => [media.id, media])),
    taxonomy,
  };
}

function toSummaryView(article: PublicArticleSummary, { mediaById, taxonomy }: LookupMaps): NewsArticleSummaryView {
  const media = article.featuredMediaId ? mediaById.get(article.featuredMediaId) : undefined;
  const category = article.categoryId
    ? taxonomy.categories.find((item) => item.id === article.categoryId)
    : undefined;
  const tags = article.tagIds
    .map((tagId) => taxonomy.tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is PublicArticleTag => Boolean(tag));

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.summary,
    featuredMediaId: article.featuredMediaId,
    coverImageUrl: media?.url ?? null,
    categoryId: article.categoryId,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    tagNames: tags.map((tag) => tag.name),
    tagSlugs: tags.map((tag) => tag.slug),
    author: article.authorName,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readingTimeMinutes: article.readingTimeMinutes,
  };
}

/** Danh mục còn hoạt động, sắp theo sortOrder (Backend đã lọc/sắp) — dùng cho NewsCategoryFilter. */
export async function listNewsCategories(): Promise<NewsCategoryOption[]> {
  const { categories } = await getPublicTaxonomy();

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
  }));
}

/** Bài đã xuất bản, mới nhất trước — nguồn dữ liệu duy nhất cho /tin-tuc. */
export async function listNewsArticles(): Promise<NewsArticleSummaryView[]> {
  const [articles, maps] = await Promise.all([listPublishedArticles(), loadLookupMaps()]);
  return articles.map((article) => toSummaryView(article, maps));
}

/**
 * Chỉ bài đã xuất bản (Backend trả 404 cho nháp/lưu trữ) — /tin-tuc/[slug] là
 * trang công khai, không lộ nội dung chưa publish.
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticleView | null> {
  const [article, maps] = await Promise.all([getPublishedArticleBySlug(slug), loadLookupMaps()]);
  if (!article) {
    return null;
  }

  return { ...toSummaryView(article, maps), content: article.content };
}

/** Ưu tiên cùng danh mục, sau đó lấy thêm cho đủ limit — không tạo bài trùng bài hiện tại. */
export async function listRelatedNewsArticles(
  current: NewsArticleSummaryView,
  limit = 3,
): Promise<NewsArticleSummaryView[]> {
  const all = await listNewsArticles();
  const others = all.filter((article) => article.id !== current.id);
  const sameCategory = others.filter((article) => article.categoryId === current.categoryId);
  const rest = others.filter((article) => article.categoryId !== current.categoryId);

  return [...sameCategory, ...rest].slice(0, limit);
}

/**
 * Bài liền kề để điều hướng "Bài trước / Bài tiếp theo" ở cuối bài. Gọi lại listNewsArticles()
 * không tốn thêm request: fetch phía dưới dùng chung cache 60 giây của Next.
 */
export async function getAdjacentNewsArticles(current: NewsArticleSummaryView): Promise<AdjacentNewsArticles> {
  const all = await listNewsArticles();
  const index = all.findIndex((article) => article.id === current.id);
  if (index === -1) {
    return { newer: null, older: null };
  }

  return { newer: all[index - 1] ?? null, older: all[index + 1] ?? null };
}
