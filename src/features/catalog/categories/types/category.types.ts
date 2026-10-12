import type { EntityStatus } from "@/shared/admin/templates/StatusBadge";

export type ManagedCategory = {
  id: string;
  name: string;
  /** null = danh mục gốc, không có parent. */
  parentId: string | null;
  sortOrder: number;
  status: EntityStatus;
};
