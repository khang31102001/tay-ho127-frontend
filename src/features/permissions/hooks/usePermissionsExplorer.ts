"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedPermission } from "../types/permission.types";
import { deletePermission, listPermissions } from "../services/permission.service";

export function usePermissionsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listPermissions, [], {
    fallbackError: "Không thể tải danh sách quyền.",
  });

  async function handleDelete(permission: ManagedPermission) {
    await deletePermission(permission.id);
    await reload();
  }

  return { permissions: data ?? [], isLoading, loadError: error, handleDelete };
}
