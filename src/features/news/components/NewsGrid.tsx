import { cn } from "@/lib/cn";

import type { NewsArticleSummaryView } from "../types/news.types";
import { NewsCard } from "./NewsCard";

type NewsGridProps = {
  articles: NewsArticleSummaryView[];
  className?: string;
  emptyMessage?: string;
};

export function NewsGrid({ articles, className, emptyMessage = "Chưa có bài viết nào." }: NewsGridProps) {
  if (articles.length === 0) {
    return <p className={cn("text-brand-muted", className)}>{emptyMessage}</p>;
  }

  return (
    <div className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
