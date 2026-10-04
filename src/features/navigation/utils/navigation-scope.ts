import type { NavigationScope } from "../types/navigation.types";

/** Độ sâu tối đa của mọi menu (khớp NavigationTreeRules.MaxDepth của Backend) — chỉ để ẩn lựa chọn hiển nhiên sai. */
export const MAX_NAVIGATION_DEPTH = 3;

type NavigationAction = "view" | "create" | "update" | "delete";

/**
 * Quyền áp dụng phụ thuộc scope của menu: `menus.*` cho Admin sidebar, `site-navigation.*` cho menu Website
 * (Backend kiểm tra lại — đây chỉ để ẩn/hiện nút).
 */
export function getNavigationPermission(scope: NavigationScope, action: NavigationAction): string {
  return scope === "admin" ? `menus.${action}` : `site-navigation.${action}`;
}

/** Đường dẫn màn quản trị — Admin sidebar và menu Website dùng chung component nhưng khác URL. */
export function getNavigationPaths(scope: NavigationScope, menuId: string | undefined) {
  if (scope === "admin") {
    return {
      tree: "/admin/system/menus",
      newItem: "/admin/system/menus/new",
      editItem: (itemId: string) => `/admin/system/menus/${itemId}`,
    };
  }

  const base = `/admin/settings/navigation/${menuId ?? ""}/items`;
  return {
    tree: base,
    newItem: `${base}/new`,
    editItem: (itemId: string) => `${base}/${itemId}`,
  };
}

export const SITE_NAVIGATION_CONTAINERS_PATH = "/admin/settings/navigation";
