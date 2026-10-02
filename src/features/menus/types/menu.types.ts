import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

/**
 * Thực đơn bán (SalesMenu của Backend Catalog) — nguồn duy nhất cho cả Admin
 * lẫn Customer Site. Site tra thực đơn theo `code` (xem
 * features/menu/services/menu.service.ts: "thuc-don-chinh", "mon-yeu-thich",
 * "goi-y-them"), nên `code` không đổi được sau khi tạo.
 */
export type ManagedMenu = {
  id: string;
  code: string;
  name: string;
  status: EntityStatus;
};
