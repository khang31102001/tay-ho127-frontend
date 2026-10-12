import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import type { PaginatedResult } from "@/lib/http/api-types";

import type {
  AdminMenuTreeNode,
  CreateNavigationItemInput,
  ManagedNavigationItem,
  ManagedNavigationMenu,
  NavigationScope,
  ReorderNavigationItemsInput,
  UpdateNavigationItemInput,
} from "../types/navigation.types";

/**
 * Backend: /api/v1/navigation/* (module Navigation) — dùng cho Admin qua BFF. Khách xem menu Website qua
 * public-navigation.service.ts (server-only), không đi qua file này.
 */

/** Sidebar của admin đang đăng nhập — Backend đã lọc sẵn theo quyền. */
export function getMySidebarMenu(): Promise<AdminMenuTreeNode[]> {
  return adminApi.get<AdminMenuTreeNode[]>("/navigation/me");
}

// ============================================================
// Containers (admin-sidebar, site-header/footer/mobile)
// ============================================================

/** Container của mọi scope mà admin có quyền xem; lọc thêm theo `scope` nếu truyền. */
export async function listMenus(scope?: NavigationScope): Promise<ManagedNavigationMenu[]> {
  const menus = await adminApi.get<ManagedNavigationMenu[]>("/navigation/containers");
  return scope ? menus.filter((menu) => menu.scope === scope) : menus;
}

export function getMenuById(id: string): Promise<ManagedNavigationMenu> {
  return adminApi.get<ManagedNavigationMenu>(`/navigation/containers/${id}`);
}

/** Container cố định (seed): chỉ đổi được tên và bật/tắt. */
export function updateMenu(id: string, input: { name: string; isActive: boolean }): Promise<ManagedNavigationMenu> {
  return adminApi.put<ManagedNavigationMenu, { name: string; isActive: boolean }>(`/navigation/containers/${id}`, input);
}

// ============================================================
// Items
// ============================================================

/** Mọi item của một menu (cả item đang tắt), theo thứ tự hiển thị. */
export async function listItemsByMenuId(menuId: string): Promise<ManagedNavigationItem[]> {
  const page = await adminApi.get<PaginatedResult<ManagedNavigationItem>>("/navigation/items", {
    params: { menuId, pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items;
}

export function getItemById(id: string): Promise<ManagedNavigationItem> {
  return adminApi.get<ManagedNavigationItem>(`/navigation/items/${id}`);
}

export function createItem(input: CreateNavigationItemInput): Promise<ManagedNavigationItem> {
  return adminApi.post<ManagedNavigationItem, CreateNavigationItemInput>("/navigation/items", input);
}

export function updateItem(id: string, input: UpdateNavigationItemInput): Promise<ManagedNavigationItem> {
  return adminApi.put<ManagedNavigationItem, UpdateNavigationItemInput>(`/navigation/items/${id}`, input);
}

/** Backend trả 409 nếu item còn mục con. */
export function deleteItem(id: string): Promise<void> {
  return adminApi.delete<void>(`/navigation/items/${id}`);
}

/** Đặt các item — đúng thứ tự — dưới một cha và đánh số lại sortOrder (kéo-thả / lên-xuống). */
export function reorderItems(menuId: string, input: ReorderNavigationItemsInput): Promise<void> {
  return adminApi.put<void, ReorderNavigationItemsInput & { menuId: string }>("/navigation/items/reorder", { menuId, ...input });
}

/** Mã quyền (lá) gate item — cần ÍT NHẤT 1 quyền trong danh sách mới thấy item; rỗng = ai cũng thấy. */
export function getItemPermissionCodes(id: string): Promise<string[]> {
  return adminApi.get<string[]>(`/navigation/items/${id}/permissions`);
}

export function setItemPermissionCodes(id: string, permissionCodes: string[]): Promise<void> {
  return adminApi.put<void, { permissionCodes: string[] }>(`/navigation/items/${id}/permissions`, { permissionCodes });
}
