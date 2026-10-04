"use client";

import { useCallback, useEffect, useState } from "react";

import { deleteOrderOptionGroup, listOrderOptionGroups } from "../services/order-option.service";
import type { ManagedOrderOptionGroup } from "../types/order-option.types";

export function useOrderOptionsExplorer() {
  const [groups, setGroups] = useState<ManagedOrderOptionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listOrderOptionGroups();
      setGroups(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  async function handleDelete(group: ManagedOrderOptionGroup) {
    await deleteOrderOptionGroup(group.id);
    await loadGroups();
  }

  return { rows: groups, isLoading, handleDelete };
}
