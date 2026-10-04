"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import { getMenuById, listMenus } from "../services/navigation.service";
import type { NavigationScope } from "../types/navigation.types";

/**
 * Container (menu) mà màn quản trị đang làm việc: theo `menuId` trên URL (menu Website), hoặc — khi không có
 * `menuId` — container duy nhất của scope (Admin sidebar).
 */
export function useNavigationMenu(scope: NavigationScope, menuId?: string) {
  return useAsyncData(
    async () => {
      if (menuId) return getMenuById(menuId);

      const [menu] = await listMenus(scope);
      if (!menu) throw new Error("Chưa có menu nào cho khu vực này — hãy chạy seed Backend.");
      return menu;
    },
    [scope, menuId],
    { fallbackError: "Không thể tải menu." },
  );
}
