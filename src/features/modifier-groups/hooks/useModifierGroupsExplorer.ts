"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import { deleteModifierGroup, listModifierGroups } from "../services/modifier-group.service";
import type { ManagedModifierGroup } from "../types/modifier-group.types";

export function useModifierGroupsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listModifierGroups, [], {
    fallbackError: "Không thể tải nhóm tùy chọn món.",
  });

  async function handleDelete(group: ManagedModifierGroup) {
    await deleteModifierGroup(group.id);
    await reload();
  }

  return { rows: data ?? [], isLoading, loadError: error, handleDelete };
}
