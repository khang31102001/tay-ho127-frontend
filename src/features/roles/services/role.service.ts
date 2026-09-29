import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { CreateRoleInput, ManagedRole, UpdateRoleInput } from "../types/role.types";

/** Backend: /api/v1/roles (module AccessControl). */
export async function listRoles(): Promise<ManagedRole[]> {
  const page = await adminApi.get<PaginatedResult<ManagedRole>>("/roles", { params: { pageSize: ADMIN_LIST_PAGE_SIZE } });
  return page.items;
}

/** Tổng số vai trò (chỉ đọc totalItems, không tải danh sách). */
export async function countRoles(): Promise<number> {
  return (await adminApi.get<PaginatedResult<ManagedRole>>("/roles", { params: { pageSize: 1 } })).totalItems;
}

export function getRoleById(id: string): Promise<ManagedRole> {
  return adminApi.get<ManagedRole>(`/roles/${id}`);
}

export function createRole(input: CreateRoleInput): Promise<ManagedRole> {
  return adminApi.post<ManagedRole, CreateRoleInput>("/roles", input);
}

export function updateRole(id: string, input: UpdateRoleInput): Promise<ManagedRole> {
  return adminApi.put<ManagedRole, UpdateRoleInput>(`/roles/${id}`, input);
}

/** Backend trả 409 nếu vai trò còn được gán cho người dùng. */
export function deleteRole(id: string): Promise<void> {
  return adminApi.delete<void>(`/roles/${id}`);
}

export function getRolePermissionIds(id: string): Promise<string[]> {
  return adminApi.get<string[]>(`/roles/${id}/permissions`);
}

/** Thay toàn bộ quyền của vai trò bằng danh sách mới. */
export function setRolePermissionIds(id: string, permissionIds: string[]): Promise<void> {
  return adminApi.put<void, { permissionIds: string[] }>(`/roles/${id}/permissions`, { permissionIds });
}
