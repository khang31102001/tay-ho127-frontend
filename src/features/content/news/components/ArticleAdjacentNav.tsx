import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/core/utils/cn";

import type { AdjacentNewsArticles, NewsArticleSummaryView } from "../types/news.types";

type ArticleAdjacentNavProps = AdjacentNewsArticles;

/** "Bài trước / Bài tiếp theo" theo thời gian xuất bản; ẩn khi chỉ có một bài. */
export function ArticleAdjacentNav({ newer, older }: ArticleAdjacentNavProps) {
  if (!newer && !older) return null;

  return (
    <nav aria-label="Bài viết khác" className="mt-12 grid gap-4 border-t border-brand-line pt-8 sm:grid-cols-2">
      {older ? <AdjacentLink article={older} direction="older" /> : <span className="hidden sm:block" />}
      {newer && <AdjacentLink article={newer} direction="newer" />}
    </nav>
  );
}

type AdjacentLinkProps = {
  article: NewsArticleSummaryView;
  direction: "older" | "newer";
};

function AdjacentLink({ article, direction }: AdjacentLinkProps) {
  const isNewer = direction === "newer";

  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className={cn(
        "card-surface focus-ring group flex flex-col gap-1 p-4 transition hover:border-brand-red",
        isNewer && "sm:items-end sm:text-right",
      )}
    >
      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-muted">
        {!isNewer && <ChevronLeft size={14} aria-hidden="true" />}
        {isNewer ? "Bài tiếp theo" : "Bài trước"}
        {isNewer && <ChevronRight size={14} aria-hidden="true" />}
      </span>
      <span className="line-clamp-2 font-black leading-snug text-brand-ink transition group-hover:text-brand-red">
        {article.title}
      </span>
    </Link>
  );
}
