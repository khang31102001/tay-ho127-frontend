/**
 * Nội dung CÔNG KHAI của Site (bài viết đã xuất bản + danh mục/thẻ đang dùng) —
 * khác hẳn model Admin (features/articles...): không có draft/archived, không
 * có mốc tạo, kèm thời gian đọc do Backend tính.
 */

export type PublicArticleSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  featuredMediaId: string | null;
  categoryId: string | null;
  tagIds: string[];
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  /** Admin tick "Hiển thị ở Tin nổi bật". */
  isFeatured: boolean;
  /** Thứ tự trong khối nổi bật (số nhỏ lên trước), null = xếp sau cùng. */
  featuredOrder: number | null;
};

/** Bài viết đầy đủ — `content` là HTML đã được Backend sanitize khi lưu. */
export type PublicArticle = PublicArticleSummary & { content: string };

export type PublicArticleCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
};

export type PublicArticleTag = {
  id: string;
  name: string;
  slug: string;
};

export type PublicTaxonomy = {
  categories: PublicArticleCategory[];
  tags: PublicArticleTag[];
};

/**
 * Banner ĐANG CHẠY (Backend đã lọc bật/tắt và khoảng startAt–endAt). `placement` là vị trí
 * hiển thị: "HOME_HERO" | "HOME_PROMOTION" | "MENU_HERO" | "ARTICLE_BANNER".
 */
export type PublicBanner = {
  id: string;
  name: string;
  desktopMediaId: string | null;
  mobileMediaId: string | null;
  altText: string;
  heading: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  placement: string;
  displayOrder: number;
};

/**
 * Section ĐANG HIỂN THỊ của 1 page đã xuất bản (Backend đã lọc isVisible), theo displayOrder.
 * `sectionKind`: "hero" | "introduction" | "promotion" | "highlight" | "testimonial" | "cta" | "story".
 * `body` là văn bản thuần. `galleryMediaIds`: ảnh phụ theo thứ tự (rỗng nếu không có).
 */
export type PublicPageSection = {
  id: string;
  sectionKind: string;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  mediaId: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  displayOrder: number;
  galleryMediaIds: string[];
};

/** Page đã xuất bản — đủ để Navigation đổi tham chiếu page thành URL. `slug` là đường dẫn trang ("/", "/thuc-don"). */
export type PublicPage = {
  id: string;
  name: string;
  slug: string;
};
