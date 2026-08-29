import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

/**
 * Danh mục bài viết — tách riêng khỏi ManagedCategory (Catalog) dù cùng dùng
 * pattern tự tham chiếu parentId, vì taxonomy khác hẳn nhau (tin tức/công
 * thức vs bánh cuốn/đồ uống). Xem quyết định #1 trong audit Phase 01.
 */
export type ManagedArticleCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  status: EntityStatus;
};
