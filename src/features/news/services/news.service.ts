// Import thẳng service của từng feature Admin (không qua barrel) — cùng lý do
// đã áp dụng ở app/(site)/bai-viet/*: barrel của các feature Admin re-export
// cả Explorer/Editor UI, import qua barrel sẽ kéo UI admin vào bundle Site.
import { listPublishedArticles, getArticleBySlug } from "@/features/articles/services/article.service";
import type { ManagedArticle } from "@/features/articles/types/article.types";
import { listMedia } from "@/features/media/services/media.service";
import type { ManagedMedia } from "@/features/media/types/media.types";
import { listArticleCategories } from "@/features/article-categories/services/article-category.service";
import type { ManagedArticleCategory } from "@/features/article-categories/types/article-category.types";
import { listArticleTags } from "@/features/article-tags/services/article-tag.service";
import type { ManagedArticleTag } from "@/features/article-tags/types/article-tag.types";

import type { NewsArticleView, NewsCategoryOption } from "../types/news.types";

const WORDS_PER_MINUTE = 200;

function estimateReadingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

type LookupMaps = {
  mediaById: Map<string, ManagedMedia>;
  categoryById: Map<string, ManagedArticleCategory>;
  tagById: Map<string, ManagedArticleTag>;
};

async function loadLookupMaps(): Promise<LookupMaps> {
  const [mediaList, categories, tags] = await Promise.all([
    listMedia(),
    listArticleCategories(),
    listArticleTags(),
  ]);

  return {
    mediaById: new Map(mediaList.map((media) => [media.id, media])),
    categoryById: new Map(categories.map((category) => [category.id, category])),
    tagById: new Map(tags.map((tag) => [tag.id, tag])),
  };
}

function toView(article: ManagedArticle, maps: LookupMaps): NewsArticleView {
  const media = article.featuredMediaId ? maps.mediaById.get(article.featuredMediaId) : undefined;
  const category = article.categoryId ? maps.categoryById.get(article.categoryId) : undefined;

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.summary,
    content: article.content,
    coverImageUrl: media?.url ?? null,
    categoryId: article.categoryId,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    tagNames: article.tagIds
      .map((tagId) => maps.tagById.get(tagId)?.name)
      .filter((name): name is string => Boolean(name)),
    author: article.authorName,
    publishedAt: article.publishedAt,
    readingTimeMinutes: estimateReadingTimeMinutes(article.content),
  };
}

/** Danh mục còn hoạt động, sắp theo sortOrder — dùng cho NewsCategoryFilter. */
export async function listNewsCategories(): Promise<NewsCategoryOption[]> {
  const categories = await listArticleCategories();

  return categories
    .filter((category) => category.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({ id: category.id, name: category.name, slug: category.slug }));
}

/** Bài viết đã xuất bản, mới nhất trước — nguồn dữ liệu duy nhất cho /tin-tuc. */
export async function listNewsArticles(): Promise<NewsArticleView[]> {
  const [articles, maps] = await Promise.all([listPublishedArticles(), loadLookupMaps()]);
  return articles.map((article) => toView(article, maps));
}

/**
 * Chỉ trả về bài đã xuất bản (khác getArticleBySlug phía Admin cho phép xem
 * bài draft/archived) — /tin-tuc/[slug] là trang công khai, không lộ nội
 * dung chưa publish.
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticleView | null> {
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") {
    return null;
  }

  const maps = await loadLookupMaps();
  return toView(article, maps);
}

/** Ưu tiên cùng danh mục, sau đó lấy thêm cho đủ limit — không tạo bài trùng bài hiện tại. */
export async function listRelatedNewsArticles(current: NewsArticleView, limit = 3): Promise<NewsArticleView[]> {
  const all = await listNewsArticles();
  const others = all.filter((article) => article.id !== current.id);
  const sameCategory = others.filter((article) => article.categoryId === current.categoryId);
  const rest = others.filter((article) => article.categoryId !== current.categoryId);

  return [...sameCategory, ...rest].slice(0, limit);
}
