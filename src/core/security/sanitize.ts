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
const TEXT_ALIGN_STYLE = { "text-align": [/^(left|right|center|justify)$/] };

const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p", "h2", "h3", "h4", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "code", "pre", "br", "hr", "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    p: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
  },
  // Chỉ giữ căn lề (TextAlign của editor) — mọi CSS khác trong style bị bỏ.
  allowedStyles: { p: TEXT_ALIGN_STYLE, h2: TEXT_ALIGN_STYLE, h3: TEXT_ALIGN_STYLE, h4: TEXT_ALIGN_STYLE },
  // Chỉ cho link http(s)/mailto/tel và ảnh http(s) — chặn javascript:, data:...
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
};

export function sanitizeHtml(html: string): string {
  return sanitize(html, SANITIZE_OPTIONS);
}
