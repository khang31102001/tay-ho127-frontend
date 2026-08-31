"use client";

import { useCallback, useEffect, useState } from "react";

import { navigationApi } from "../api/navigation.api";
import type { ManagedNavigationMenu } from "../types/navigation.types";

export function useNavigationMenusExplorer() {
  const [menus, setMenus] = useState<ManagedNavigationMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      setMenus(await navigationApi.getAll());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  async function handleDelete(menu: ManagedNavigationMenu) {
    await navigationApi.deleteMenu(menu.id);
    await loadMenus();
  }

  return { rows: menus, isLoading, handleDelete };
}
