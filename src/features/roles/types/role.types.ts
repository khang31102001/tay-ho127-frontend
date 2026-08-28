import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

export const PERMISSION_OPTIONS = [
  { key: "menu:manage", label: "Quản lý thực đơn" },
  { key: "user:manage", label: "Quản lý người dùng" },
  { key: "role:manage", label: "Quản lý vai trò" },
  { key: "order:manage", label: "Quản lý đơn hàng" },
] as const;

export type PermissionKey = (typeof PERMISSION_OPTIONS)[number]["key"];

export type ManagedRole = {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  status: EntityStatus;
};
