import DOMPurify from "isomorphic-dompurify";

/**
 * Làm sạch HTML trước khi render bằng dangerouslySetInnerHTML — dùng cho mọi
 * nội dung do Admin nhập qua RichTextEditor (Tiptap) trước khi hiển thị trên
 * Site. Tiptap/ProseMirror đã giới hạn schema khi soạn, nhưng dữ liệu đọc từ
 * localStorage không đảm bảo luôn đi qua đúng đường đó, nên vẫn phải sanitize
 * ở điểm render (xem risk "XSS với Article Content" trong audit Phase 01/08).
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "h2",
      "h3",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "br",
      "a",
      "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt"],
  });
}
