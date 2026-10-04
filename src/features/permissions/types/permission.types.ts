/**
 * PermissionResponse của Backend (module AccessControl). Cây quyền: Module → Nhóm tài nguyên → Quyền (lá).
 * - Quyền lá (`isGroup` false): `code` dạng "<resource>.<action>", vd. "users.view" — là thứ API kiểm tra.
 * - Nhóm (`isGroup` true): `code` dạng "group:<...>", chỉ để gom hiển thị; không bao giờ gán trực tiếp cho vai trò.
 */
export type ManagedPermission = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  parentId: string | null;
  isGroup: boolean;
  sortOrder: number;
};

/** PermissionTreeNode của Backend (GET /permissions/tree) — chỉ node đang hoạt động, đã sắp theo sortOrder. */
export type PermissionTreeNode = {
  id: string;
  code: string;
  name: string;
  isGroup: boolean;
  sortOrder: number;
  children: PermissionTreeNode[];
};

export type CreatePermissionInput = {
  code: string;
  name: string;
  /** Quyền lá bắt buộc có nhóm cha; nhóm gốc (module) để null. */
  parentId: string | null;
  isGroup: boolean;
  sortOrder: number;
};

export type UpdatePermissionInput = {
  name: string;
  isActive: boolean;
  parentId: string | null;
  isGroup: boolean;
  sortOrder: number;
};
