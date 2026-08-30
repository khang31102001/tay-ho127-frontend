import { sanitizeHtml } from "@/lib/sanitize-html";

type ArticleContentProps = {
  html: string;
};

/**
 * Render HTML từ RichTextEditor (Tiptap) — luôn sanitize trước khi render
 * (xem src/lib/sanitize-html.ts). Cùng bộ class prose với bai-viet/[slug]
 * để 2 route dùng chung 1 ngôn ngữ typography cho nội dung CMS.
 */
export function ArticleContent({ html }: ArticleContentProps) {
  return (
    <div
      className="prose prose-sm mt-8 max-w-none text-[15px] leading-7 text-brand-ink [&_a]:text-brand-red [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-brand-line [&_blockquote]:pl-4 [&_blockquote]:text-brand-muted [&_h2]:mt-6 [&_h2]:text-[20px] [&_h2]:font-black [&_h3]:mt-5 [&_h3]:text-[17px] [&_h3]:font-black [&_img]:rounded-card [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
