import type { NewsArticleView } from "../types/news.types";
import { NewsGrid } from "./NewsGrid";

type RelatedArticlesProps = {
  articles: NewsArticleView[];
};

/** Reuse NewsGrid/NewsCard — không tạo RelatedNewsCard riêng vì UI/responsibility giống hệt. */
export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-brand-line pt-10">
      <h2 className="heading-section text-brand-ink">Bài viết liên quan</h2>
      <NewsGrid articles={articles} className="mt-6" />
    </section>
  );
}
