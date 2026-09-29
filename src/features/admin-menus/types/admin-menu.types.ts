/**
 * Menu quản trị (module Navigation của Backend) — sidebar Admin theo quyền.
 * KHÁC features/navigation (menu Header/Footer của Site).
 */

/** MenuTreeNode của Backend — `route` null + có children = tiêu đề nhóm. */
export type AdminMenuTreeNode = {
  id: string;
  code: string;
  name: string;
  route: string | null;
  /** Tên icon lucide-react (xem features/navigation/utils/icon-registry.ts). */
  icon: string | null;
  sortOrder: number;
  children: AdminMenuTreeNode[];
};

/** MenuResponse của Backend. */
export type ManagedAdminMenu = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  parentId: string | null;
  route: string | null;
  icon: string | null;
  sortOrder: number;
};

export type CreateAdminMenuInput = {
  code: string;
  name: string;
  parentId: string | null;
  route: string | null;
  icon: string | null;
  sortOrder: number;
};

export type UpdateAdminMenuInput = Omit<CreateAdminMenuInput, "code"> & { isActive: boolean };
