import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type {
  CreateUserInput,
  ManagedUser,
  ManagedUserDetails,
  UpdateUserInput,
  UserRoleAssignment,
} from "../types/user.types";

/** Backend: /api/v1/users (module Identity). Không có API xóa — khóa tài khoản bằng isActive = false. */
export async function listUsers(): Promise<ManagedUser[]> {
  const page = await adminApi.get<PaginatedResult<ManagedUser>>("/users", { params: { pageSize: ADMIN_LIST_PAGE_SIZE } });
  return page.items;
}

/** Tổng số tài khoản (chỉ đọc totalItems, không tải danh sách). */
export async function countUsers(): Promise<number> {
  return (await adminApi.get<PaginatedResult<ManagedUser>>("/users", { params: { pageSize: 1 } })).totalItems;
}

export function getUserById(id: string): Promise<ManagedUserDetails> {
  return adminApi.get<ManagedUserDetails>(`/users/${id}`);
}

export function createUser(input: CreateUserInput): Promise<ManagedUserDetails> {
  return adminApi.post<ManagedUserDetails, CreateUserInput>("/users", input);
}

export function updateUser(id: string, input: UpdateUserInput): Promise<ManagedUserDetails> {
  return adminApi.put<ManagedUserDetails, UpdateUserInput>(`/users/${id}`, input);
}

export function resetUserPassword(id: string, newPassword: string): Promise<void> {
  return adminApi.post<void, { newPassword: string }>(`/users/${id}/reset-password`, { newPassword });
}

// ---- Vai trò của người dùng: /api/v1/users/{id}/roles (module AccessControl) ----

export function listUserRoles(userId: string): Promise<UserRoleAssignment[]> {
  return adminApi.get<UserRoleAssignment[]>(`/users/${userId}/roles`);
}

export function assignUserRole(userId: string, roleId: string): Promise<void> {
  return adminApi.post<void, { roleId: string }>(`/users/${userId}/roles`, { roleId });
}

export function removeUserRole(userId: string, roleId: string): Promise<void> {
  return adminApi.delete<void>(`/users/${userId}/roles/${roleId}`);
}
