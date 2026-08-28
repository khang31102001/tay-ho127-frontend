"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedMenu } from "../types/menu.types";
import { deleteMenu, listMenus } from "../services/menu.service";

export function useMenusExplorer() {
  const [menus, setMenus] = useState<ManagedMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMenus = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listMenus();
      setMenus(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  async function handleDelete(menu: ManagedMenu) {
    await deleteMenu(menu.id);
    await loadMenus();
  }

  return {
    menus,
    isLoading,
    handleDelete,
  };
}
