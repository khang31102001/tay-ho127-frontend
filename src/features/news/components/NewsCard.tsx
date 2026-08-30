import Image from "next/image";
import Link from "next/link";

import type { NewsArticleView } from "../types/news.types";
import { NewsMeta } from "./NewsMeta";

type NewsCardProps = {
  article: NewsArticleView;
};

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="card-surface group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
    >
      <NewsCardImage src={article.coverImageUrl} alt={article.title} />

      <div className="flex flex-1 flex-col gap-2 p-5">
        <NewsMeta category={article.categoryName} publishedAt={article.publishedAt} />

        <h3 className="line-clamp-2 text-[18px] font-black leading-snug text-brand-ink">{article.title}</h3>

        <p className="line-clamp-2 text-sm text-brand-muted">{article.excerpt}</p>
      </div>
    </Link>
  );
}

type NewsCardImageProps = {
  src: string | null;
  alt: string;
};

function NewsCardImage({ src, alt }: NewsCardImageProps) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-cream">
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
    </div>
  );
}
