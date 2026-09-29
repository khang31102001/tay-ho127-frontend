/** RoleResponse của Backend (module AccessControl). `code` là khóa ổn định, vd. "super-admin". */
export type ManagedRole = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAtUtc: string;
};

export type CreateRoleInput = {
  code: string;
  name: string;
};

export type UpdateRoleInput = {
  name: string;
  isActive: boolean;
};
