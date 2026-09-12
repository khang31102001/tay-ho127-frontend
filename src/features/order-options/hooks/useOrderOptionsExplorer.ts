"use client";

import { useCallback, useEffect, useState } from "react";

import { orderOptionApi } from "../api/order-option-api";
import type { ManagedOrderOptionGroup } from "../types/order-option.types";

export function useOrderOptionsExplorer() {
  const [groups, setGroups] = useState<ManagedOrderOptionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await orderOptionApi.list();
      setGroups(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  async function handleDelete(group: ManagedOrderOptionGroup) {
    await orderOptionApi.delete(group.id);
    await loadGroups();
  }

  return { rows: groups, isLoading, handleDelete };
}
