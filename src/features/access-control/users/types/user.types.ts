/**
 * Tài khoản quản trị (module Identity của Backend) — khác AdminUser (danh tính
 * của chính admin đang đăng nhập, features/admin-auth) và khác Customer.
 */

/** UserResponse (danh sách) của Backend. */
export type ManagedUser = {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAtUtc: string;
};

/** UserDetailsResponse của Backend. */
export type ManagedUserDetails = ManagedUser & {
  currentBrandId: string | null;
  currentFiscalYearId: string | null;
  updatedAtUtc: string | null;
};

export type CreateUserInput = { email: string; fullName: string; password: string };
export type UpdateUserInput = { fullName: string; isActive: boolean };

/** GET /users/{id}/roles. */
export type UserRoleAssignment = { roleId: string; roleCode: string; roleName: string };
