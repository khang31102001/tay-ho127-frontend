import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

/**
 * Tài khoản người dùng hệ thống do Admin quản lý (không phải AdminUser —
 * đó là danh tính của chính admin đang đăng nhập, xem src/types/admin-auth.ts).
 */
export type ManagedUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  /** Tên role, tham chiếu ManagedRole.name (xem src/types/admin-role.ts). */
  role: string;
  status: EntityStatus;
  createdAt: string;
};
