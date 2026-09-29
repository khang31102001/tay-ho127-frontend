"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedRole } from "../types/role.types";
import { deleteRole, listRoles } from "../services/role.service";

export function useRolesExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listRoles, [], {
    fallbackError: "Không thể tải danh sách vai trò.",
  });

  async function handleDelete(role: ManagedRole) {
    await deleteRole(role.id);
    await reload();
  }

  return { roles: data ?? [], isLoading, loadError: error, handleDelete };
}
