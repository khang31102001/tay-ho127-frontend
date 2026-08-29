import { normalizeText } from "./normalize-text";

/**
 * Chuyển chuỗi (có dấu tiếng Việt) thành slug URL-safe: thường, bỏ dấu,
 * chỉ giữ chữ/số, nối bằng dấu gạch ngang. Dùng cho slug Page/Article.
 */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
