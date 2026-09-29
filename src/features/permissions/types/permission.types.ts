/** PermissionResponse của Backend (module AccessControl). `code` dạng "<domain>.<action>", vd. "users.view". */
export type ManagedPermission = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type CreatePermissionInput = {
  code: string;
  name: string;
};

export type UpdatePermissionInput = {
  name: string;
  isActive: boolean;
};
