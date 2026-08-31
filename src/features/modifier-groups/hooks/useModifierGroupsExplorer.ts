"use client";

import { useCallback, useEffect, useState } from "react";

import { deleteModifierGroup, listModifierGroups } from "../services/modifier-group.service";
import type { ManagedModifierGroup } from "../types/modifier-group.types";

export function useModifierGroupsExplorer() {
  const [groups, setGroups] = useState<ManagedModifierGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listModifierGroups();
      setGroups(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  async function handleDelete(group: ManagedModifierGroup) {
    await deleteModifierGroup(group.id);
    await loadGroups();
  }

  return { rows: groups, isLoading, handleDelete };
}
