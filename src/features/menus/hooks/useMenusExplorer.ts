"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedMenu } from "../types/menu.types";
import { deleteMenu, listMenus } from "../services/menu.service";

export function useMenusExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listMenus, [], {
    fallbackError: "Không thể tải thực đơn.",
  });

  async function handleDelete(menu: ManagedMenu) {
    await deleteMenu(menu.id);
    await reload();
  }

  return {
    menus: data ?? [],
    isLoading,
    loadError: error,
    handleDelete,
  };
}
