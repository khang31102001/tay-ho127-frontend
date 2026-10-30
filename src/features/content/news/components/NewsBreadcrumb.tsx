import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type NewsBreadcrumbItem = {
  name: string;
  /** Bỏ trống cho mục cuối (trang hiện tại). */
  href?: string;
};

type NewsBreadcrumbProps = {
  items: NewsBreadcrumbItem[];
};

/** Breadcrumb hiển thị (JSON-LD BreadcrumbList do trang tự dựng riêng). */
export function NewsBreadcrumb({ items }: NewsBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-brand-muted">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex min-w-0 items-center gap-1.5">
            {index > 0 && <ChevronRight size={14} aria-hidden="true" className="shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="focus-ring rounded font-bold text-brand-green transition hover:opacity-80">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 text-brand-ink">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
