import Image from "next/image";
import Link from "next/link";

import type { NewsArticleSummaryView } from "../types/news.types";
import { NewsMeta } from "./NewsMeta";

type NewsLatestListProps = {
  articles: NewsArticleSummaryView[];
};

/** "Tin mới": danh sách gọn (ảnh nhỏ + tiêu đề + trích đoạn), 2 cột từ tablet trở lên. */
export function NewsLatestList({ articles }: NewsLatestListProps) {
  if (articles.length === 0) return null;

  return (
    <ul className="grid gap-x-8 md:grid-cols-2">
      {articles.map((article) => (
        <li key={article.id} className="border-b border-brand-line">
          <Link href={`/tin-tuc/${article.slug}`} className="focus-ring group flex gap-4 rounded-card py-4">
            <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-card bg-brand-cream sm:w-36">
              {article.coverImageUrl && (
                <Image
                  src={article.coverImageUrl}
                  alt={article.title}
                  fill
                  sizes="144px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <NewsMeta category={article.categoryName} publishedAt={article.publishedAt} />
              <h3 className="line-clamp-2 text-[16px] font-black leading-snug text-brand-ink transition group-hover:text-brand-red">
                {article.title}
              </h3>
              <p className="line-clamp-2 text-sm text-brand-muted">{article.excerpt}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
