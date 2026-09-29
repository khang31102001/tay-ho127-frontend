import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type {
  AdminMenuTreeNode,
  CreateAdminMenuInput,
  ManagedAdminMenu,
  UpdateAdminMenuInput,
} from "../types/admin-menu.types";

/** Sidebar của admin đang đăng nhập — Backend đã lọc sẵn theo quyền (GET /navigation/menus). */
export function getMySidebarMenu(): Promise<AdminMenuTreeNode[]> {
  return adminApi.get<AdminMenuTreeNode[]>("/navigation/menus");
}

/** Backend: /api/v1/menus (quản trị toàn bộ menu, kể cả menu không hoạt động). */
export async function listAdminMenus(): Promise<ManagedAdminMenu[]> {
  const page = await adminApi.get<PaginatedResult<ManagedAdminMenu>>("/menus", { params: { pageSize: ADMIN_LIST_PAGE_SIZE } });
  return page.items;
}

export function getAdminMenuById(id: string): Promise<ManagedAdminMenu> {
  return adminApi.get<ManagedAdminMenu>(`/menus/${id}`);
}

export function createAdminMenu(input: CreateAdminMenuInput): Promise<ManagedAdminMenu> {
  return adminApi.post<ManagedAdminMenu, CreateAdminMenuInput>("/menus", input);
}

export function updateAdminMenu(id: string, input: UpdateAdminMenuInput): Promise<ManagedAdminMenu> {
  return adminApi.put<ManagedAdminMenu, UpdateAdminMenuInput>(`/menus/${id}`, input);
}

/** Backend trả 409 nếu menu còn menu con. */
export function deleteAdminMenu(id: string): Promise<void> {
  return adminApi.delete<void>(`/menus/${id}`);
}

/** Mã quyền gate menu — admin cần ÍT NHẤT 1 quyền trong danh sách mới thấy menu; rỗng = ai cũng thấy. */
export function getAdminMenuPermissionCodes(id: string): Promise<string[]> {
  return adminApi.get<string[]>(`/menus/${id}/permissions`);
}

export function setAdminMenuPermissionCodes(id: string, permissionCodes: string[]): Promise<void> {
  return adminApi.put<void, { permissionCodes: string[] }>(`/menus/${id}/permissions`, { permissionCodes });
}
