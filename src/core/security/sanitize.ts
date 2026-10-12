import sanitize from "sanitize-html";

/**
 * Làm sạch HTML trước khi render bằng dangerouslySetInnerHTML — dùng cho mọi
 * nội dung do Admin nhập qua RichTextEditor (Tiptap) trước khi hiển thị trên
 * Site. Tiptap/ProseMirror đã giới hạn schema khi soạn, nhưng dữ liệu đọc từ
 * Backend không đảm bảo luôn đi qua đúng đường đó, nên vẫn phải sanitize
 * ở điểm render (xem risk "XSS với Article Content" trong audit Phase 01/08).
 *
 * Dùng sanitize-html (thuần JS) thay vì DOMPurify: DOMPurify trên server cần
 * jsdom, mà jsdom làm trang chi tiết tin tức lỗi 500 trên Vercel serverless.
 */
const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: ["p", "h2", "h3", "strong", "em", "ul", "ol", "li", "blockquote", "code", "pre", "br", "a", "img"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
  },
  // Chỉ cho link http(s)/mailto/tel và ảnh http(s) — chặn javascript:, data:...
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
};

export function sanitizeHtml(html: string): string {
  return sanitize(html, SANITIZE_OPTIONS);
}
