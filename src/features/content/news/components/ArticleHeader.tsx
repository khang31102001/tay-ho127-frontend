import { NewsMeta } from "./NewsMeta";

type ArticleHeaderProps = {
  category: string | null;
  title: string;
  publishedAt: string | null;
  updatedAt: string | null;
  readingTimeMinutes: number;
  excerpt: string;
};

/** Chỉ báo "Cập nhật" khi bài được sửa sau lúc xuất bản quá ngưỡng này (lưu ngay sau khi publish không tính). */
const UPDATE_THRESHOLD_MS = 60 * 60 * 1000;

function formatUpdatedAt(publishedAt: string | null, updatedAt: string | null): string | null {
  if (!publishedAt || !updatedAt) return null;

  const updated = new Date(updatedAt);
  if (updated.getTime() - new Date(publishedAt).getTime() < UPDATE_THRESHOLD_MS) return null;

  return updated.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function ArticleHeader({ category, title, publishedAt, updatedAt, readingTimeMinutes, excerpt }: ArticleHeaderProps) {
  const updatedLabel = formatUpdatedAt(publishedAt, updatedAt);

  return (
    <div>
      <NewsMeta category={category} publishedAt={publishedAt} readingTimeMinutes={readingTimeMinutes} />

      <h1 className="heading-1 mt-2 text-brand-ink">{title}</h1>

      {updatedLabel && (
        <p className="mt-2 text-xs text-brand-muted">
          Cập nhật lúc <time dateTime={updatedAt ?? undefined}>{updatedLabel}</time>
        </p>
      )}

      {excerpt && <p className="body-lead mt-3">{excerpt}</p>}
    </div>
  );
}
