"use client";

import { useMemo } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedAdminMenu } from "../types/admin-menu.types";
import { deleteAdminMenu, listAdminMenus } from "../services/admin-menu.service";

export type AdminMenuRow = ManagedAdminMenu & { parentName: string };

export function useAdminMenusExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listAdminMenus, [], {
    fallbackError: "Không thể tải danh sách menu.",
  });

  // Sắp theo cây: nhóm/menu gốc theo sortOrder, menu con ngay dưới cha.
  const rows = useMemo<AdminMenuRow[]>(() => {
    const menus = data ?? [];
    const byId = new Map(menus.map((menu) => [menu.id, menu]));
    const bySort = (a: ManagedAdminMenu, b: ManagedAdminMenu) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    const toRow = (menu: ManagedAdminMenu): AdminMenuRow => ({
      ...menu,
      parentName: menu.parentId ? byId.get(menu.parentId)?.name ?? "" : "",
    });

    return menus
      .filter((menu) => !menu.parentId || !byId.has(menu.parentId))
      .sort(bySort)
      .flatMap((root) => [toRow(root), ...menus.filter((menu) => menu.parentId === root.id).sort(bySort).map(toRow)]);
  }, [data]);

  async function handleDelete(menu: ManagedAdminMenu) {
    await deleteAdminMenu(menu.id);
    await reload();
  }

  return { rows, isLoading, loadError: error, handleDelete };
}
