import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";

import type { NewsArticleView } from "../types/news.types";
import { NewsMeta } from "./NewsMeta";

type FeaturedArticleProps = {
  article: NewsArticleView;
};

/** Desktop: [Large Image] [Content] cạnh nhau; Mobile: ảnh trên, nội dung dưới. */
export function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <Reveal type="fade-up">
      <Link
        href={`/tin-tuc/${article.slug}`}
        className="card-surface group grid overflow-hidden lg:grid-cols-2"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-cream lg:aspect-auto">
          {article.coverImageUrl && (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          )}
        </div>

        <div className="flex flex-col justify-center gap-3 p-6 sm:p-8 lg:p-10">
          <NewsMeta category={article.categoryName} publishedAt={article.publishedAt} />

          <h2 className="heading-section text-brand-ink">{article.title}</h2>

          <p className="body-lead">{article.excerpt}</p>

          <span className="focus-ring mt-2 inline-flex w-fit items-center gap-1.5 rounded-full text-sm font-bold text-brand-red transition group-hover:gap-2.5">
            Xem chi tiết
            <ChevronRight size={16} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
