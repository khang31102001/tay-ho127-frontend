"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/core/utils/cn";

type AdminCollapsibleSectionProps = {
  title: string;
  /** Dòng tóm tắt nội dung khối khi đang thu gọn (và cả khi mở), để khỏi phải mở ra mới biết. */
  summary?: ReactNode;
  /** Cảnh báo ngắn (vd. "Chưa chọn ảnh") — hiện màu đỏ thay cho tóm tắt. */
  warning?: string | null;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Khối thu/mở cho form Admin dài (Editor): tiêu đề + dòng tóm tắt luôn thấy, nội dung chỉ hiện khi mở. Nội dung bị gỡ
 * khỏi DOM khi thu gọn (state nằm ở hook của form nên không mất dữ liệu); vì vậy ô `required` nên đặt ở khối mở sẵn.
 */
export function AdminCollapsibleSection({ title, summary, warning, defaultOpen = false, children }: AdminCollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section className="rounded-admin border border-admin-border bg-admin-surface">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors duration-admin hover:bg-admin-subtle focus-visible:ring-2 focus-visible:ring-admin-focus/40"
      >
        <span className="shrink-0 text-admin-base font-bold text-admin-text">{title}</span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-admin-sm",
            warning ? "font-semibold text-admin-dangerText" : "text-admin-textSecondary",
          )}
        >
          {warning ?? summary}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 text-admin-muted transition-transform duration-admin", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div id={bodyId} className="space-y-4 border-t border-admin-border px-4 py-4">
          {children}
        </div>
      )}
    </section>
  );
}
