import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { CreatePermissionInput, ManagedPermission, UpdatePermissionInput } from "../types/permission.types";

/** Backend: /api/v1/permissions (module AccessControl). */
export async function listPermissions(): Promise<ManagedPermission[]> {
  const page = await adminApi.get<PaginatedResult<ManagedPermission>>("/permissions", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items;
}

export function getPermissionById(id: string): Promise<ManagedPermission> {
  return adminApi.get<ManagedPermission>(`/permissions/${id}`);
}

export function createPermission(input: CreatePermissionInput): Promise<ManagedPermission> {
  return adminApi.post<ManagedPermission, CreatePermissionInput>("/permissions", input);
}

export function updatePermission(id: string, input: UpdatePermissionInput): Promise<ManagedPermission> {
  return adminApi.put<ManagedPermission, UpdatePermissionInput>(`/permissions/${id}`, input);
}

/** Backend trả 409 nếu quyền còn được gán cho vai trò nào đó. */
export function deletePermission(id: string): Promise<void> {
  return adminApi.delete<void>(`/permissions/${id}`);
}
