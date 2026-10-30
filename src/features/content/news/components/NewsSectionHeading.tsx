import Link from "next/link";
import { ChevronRight } from "lucide-react";

type NewsSectionHeadingProps = {
  title: string;
  /** Gắn cho <h2> để <section aria-labelledby> trỏ tới. */
  id?: string;
  /** Link "Xem tất cả" bên phải tiêu đề; bỏ trống thì không hiện. */
  href?: string;
  linkLabel?: string;
};

/** Tiêu đề khối dùng chung cho trang Tin tức: Tin nổi bật, Tin mới, từng danh mục. */
export function NewsSectionHeading({ title, id, href, linkLabel = "Xem tất cả" }: NewsSectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-brand-line pb-3">
      <h2 id={id} className="heading-section text-brand-ink">{title}</h2>

      {href && (
        <Link
          href={href}
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-full text-sm font-bold text-brand-red transition hover:gap-2"
        >
          {linkLabel}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
