import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

/**
 * Thực đơn trong hệ thống Catalog — nguồn duy nhất cho cả Admin lẫn Customer
 * Site (xem features/menu/services/menu.service.ts, ID "menu-thuc-don-chinh"
 * và "menu-mon-yeu-thich" chi phối trực tiếp /thuc-don và trang chủ).
 */
export type ManagedMenu = {
  id: string;
  name: string;
  status: EntityStatus;
};
