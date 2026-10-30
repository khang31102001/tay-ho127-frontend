import { sanitizeHtml } from "@/core/security/sanitize";
import { RICH_TEXT_CONTENT_CLASS } from "@/shared/ui/rich-text-content";

type ArticleContentProps = {
  html: string;
};

/**
 * Render HTML từ RichTextEditor (Tiptap) — luôn sanitize trước khi render
 * (xem src/lib/sanitize-html.ts). Typography cho nội dung CMS
 * để 2 route dùng chung 1 ngôn ngữ typography cho nội dung CMS.
 */
export function ArticleContent({ html }: ArticleContentProps) {
  return (
    <div
      className={`${RICH_TEXT_CONTENT_CLASS} mt-8`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
