import { NewsMeta } from "./NewsMeta";

type ArticleHeaderProps = {
  category: string | null;
  title: string;
  publishedAt: string | null;
  readingTimeMinutes: number;
  excerpt: string;
};

export function ArticleHeader({ category, title, publishedAt, readingTimeMinutes, excerpt }: ArticleHeaderProps) {
  return (
    <div>
      <NewsMeta category={category} publishedAt={publishedAt} readingTimeMinutes={readingTimeMinutes} />

      <h1 className="heading-1 mt-2 text-brand-ink">{title}</h1>

      {excerpt && <p className="body-lead mt-3">{excerpt}</p>}
    </div>
  );
}
