import type { ManagedArticleCategory } from "../types/article-category.types";

export const SEED_ARTICLE_CATEGORIES: ManagedArticleCategory[] = [
  { id: "artcat-cong-thuc", name: "Công thức", slug: "cong-thuc", parentId: null, sortOrder: 1, status: "active" },
  { id: "artcat-cau-chuyen", name: "Câu chuyện thương hiệu", slug: "cau-chuyen-thuong-hieu", parentId: null, sortOrder: 2, status: "active" },
  { id: "artcat-tin-tuc", name: "Tin tức & Khuyến mãi", slug: "tin-tuc-khuyen-mai", parentId: null, sortOrder: 3, status: "active" },
];
