type NewsMetaProps = {
  category?: string | null;
  publishedAt?: string | null;
  readingTimeMinutes?: number;
};

/**
 * Dòng meta dùng chung: Category · Ngày đăng · Thời gian đọc (tùy chọn).
 * Dùng lại ở NewsCard, FeaturedArticle và ArticleHeader — không lặp format ngày.
 */
export function NewsMeta({ category, publishedAt, readingTimeMinutes }: NewsMetaProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
      {category && <span className="font-bold uppercase tracking-wide text-brand-red">{category}</span>}
      {category && (formattedDate || readingTimeMinutes !== undefined) && <span aria-hidden="true">·</span>}
      {formattedDate && <span>{formattedDate}</span>}
      {readingTimeMinutes !== undefined && (
        <>
          {formattedDate && <span aria-hidden="true">·</span>}
          <span>{readingTimeMinutes} phút đọc</span>
        </>
      )}
    </div>
  );
}
