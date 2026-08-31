import { api } from "@/lib/http/api-client";
import { getApiMode } from "@/lib/http/api-mode";

import * as mockNavigationService from "../services/navigation.service";
import type {
  ManagedNavigationItem,
  ManagedNavigationMenu,
  NavigationLocation,
  NavigationMenu,
} from "../types/navigation.types";
import type {
  NavigationItemUpsertInput,
  NavigationMenuUpsertInput,
  ReorderNavigationItemsInput,
} from "../services/navigation.service";

/**
 * TEMPORARY CONTRACT — endpoint REST đề xuất cho Backend ASP.NET Core tương
 * lai (xem mục 8 của task gốc). "byCode"/"itemsByMenu" không nằm trong danh
 * sách gốc — suy ra hợp lý theo cùng convention REST, cần Backend xác nhận
 * lại khi thật sự implement.
 */
const ENDPOINTS = {
  byLocation: (location: NavigationLocation) => `/navigation/locations/${location}`,
  byCode: (code: string) => `/navigation/menus/by-code/${code}`,
  menus: "/navigation/menus",
  menuById: (id: string) => `/navigation/menus/${id}`,
  itemsByMenu: (menuId: string) => `/navigation/menus/${menuId}/items`,
  itemById: (itemId: string) => `/navigation/items/${itemId}`,
  itemVisibility: (itemId: string) => `/navigation/items/${itemId}/visibility`,
  itemsReorder: (menuId: string) => `/navigation/menus/${menuId}/items/reorder`,
};

/**
 * Public API duy nhất mà Component/Feature khác được gọi — không component
 * nào được biết bên dưới đang chạy mock hay Backend thật (không có
 * `if (apiMode === "mock")` ở nơi gọi, toàn bộ nhánh rẽ nằm gọn trong file
 * này). Khi NEXT_PUBLIC_API_MODE=real, mỗi method tự chuyển sang gọi Global
 * HTTP Client (api-client.ts) — không phải sửa nơi gọi.
 */
export const navigationApi = {
  async getByLocation(location: NavigationLocation): Promise<NavigationMenu | null> {
    if (getApiMode() === "real") {
      return api.get<NavigationMenu | null>(ENDPOINTS.byLocation(location));
    }
    return mockNavigationService.getAssembledMenuByLocation(location);
  },

  async getByCode(code: string): Promise<NavigationMenu | null> {
    if (getApiMode() === "real") {
      return api.get<NavigationMenu | null>(ENDPOINTS.byCode(code));
    }
    return mockNavigationService.getAssembledMenuByCode(code);
  },

  async getAll(): Promise<ManagedNavigationMenu[]> {
    if (getApiMode() === "real") {
      return api.get<ManagedNavigationMenu[]>(ENDPOINTS.menus);
    }
    return mockNavigationService.listMenus();
  },

  async getById(id: string): Promise<ManagedNavigationMenu | undefined> {
    if (getApiMode() === "real") {
      return api.get<ManagedNavigationMenu>(ENDPOINTS.menuById(id));
    }
    return mockNavigationService.getMenuById(id);
  },

  async createMenu(data: NavigationMenuUpsertInput): Promise<ManagedNavigationMenu> {
    if (getApiMode() === "real") {
      return api.post<ManagedNavigationMenu, NavigationMenuUpsertInput>(ENDPOINTS.menus, data);
    }
    return mockNavigationService.createMenu(data);
  },

  async updateMenu(id: string, data: NavigationMenuUpsertInput): Promise<ManagedNavigationMenu> {
    if (getApiMode() === "real") {
      return api.put<ManagedNavigationMenu, NavigationMenuUpsertInput>(ENDPOINTS.menuById(id), data);
    }
    return mockNavigationService.updateMenu(id, data);
  },

  async deleteMenu(id: string): Promise<void> {
    if (getApiMode() === "real") {
      return api.delete<void>(ENDPOINTS.menuById(id));
    }
    return mockNavigationService.deleteMenu(id);
  },

  /** Không nằm trong danh sách public API gốc của task, nhưng cần cho màn Admin Tree — xem ghi chú ENDPOINTS.itemsByMenu. */
  async getItemsByMenuId(menuId: string): Promise<ManagedNavigationItem[]> {
    if (getApiMode() === "real") {
      return api.get<ManagedNavigationItem[]>(ENDPOINTS.itemsByMenu(menuId));
    }
    return mockNavigationService.listItemsByMenuId(menuId);
  },

  async getItemById(itemId: string): Promise<ManagedNavigationItem | undefined> {
    if (getApiMode() === "real") {
      return api.get<ManagedNavigationItem>(ENDPOINTS.itemById(itemId));
    }
    return mockNavigationService.getItemById(itemId);
  },

  async createItem(menuId: string, data: Omit<NavigationItemUpsertInput, "menuId">): Promise<ManagedNavigationItem> {
    if (getApiMode() === "real") {
      return api.post<ManagedNavigationItem, typeof data>(ENDPOINTS.itemsByMenu(menuId), data);
    }
    return mockNavigationService.createItem({ ...data, menuId });
  },

  async updateItem(itemId: string, data: NavigationItemUpsertInput): Promise<ManagedNavigationItem> {
    if (getApiMode() === "real") {
      return api.put<ManagedNavigationItem, NavigationItemUpsertInput>(ENDPOINTS.itemById(itemId), data);
    }
    return mockNavigationService.updateItem(itemId, data);
  },

  async deleteItem(itemId: string): Promise<void> {
    if (getApiMode() === "real") {
      return api.delete<void>(ENDPOINTS.itemById(itemId));
    }
    return mockNavigationService.deleteItem(itemId);
  },

  async toggleItemVisibility(itemId: string): Promise<ManagedNavigationItem> {
    if (getApiMode() === "real") {
      return api.patch<ManagedNavigationItem>(ENDPOINTS.itemVisibility(itemId));
    }
    return mockNavigationService.toggleItemVisibility(itemId);
  },

  /**
   * menuId chỉ dùng để dựng URL khi gọi Backend thật (REST convention gom
   * theo menu) — mock không cần vì item store đã tự biết cha/con qua parentId.
   */
  async reorderItems(menuId: string, data: ReorderNavigationItemsInput): Promise<void> {
    if (getApiMode() === "real") {
      return api.patch<void, ReorderNavigationItemsInput>(ENDPOINTS.itemsReorder(menuId), data);
    }
    return mockNavigationService.reorderItems(data);
  },
};
