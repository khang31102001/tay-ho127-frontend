"use client";

import { useMemo } from "react";

import { useAsyncData } from "@/hooks/useAsyncData";

import type { ManagedPermission } from "../types/permission.types";
import { deletePermission, listPermissions } from "../services/permission.service";
import { flattenPermissionsAsTree } from "../utils/permission-tree";

export function usePermissionsExplorer() {
  const { data, isLoading, error, reload } = useAsyncData(listPermissions, [], {
    fallbackError: "Không thể tải danh sách quyền.",
  });

  // Hiển thị theo thứ tự cây (Module → Nhóm → Quyền) thay vì sắp theo mã.
  const permissions = useMemo(() => flattenPermissionsAsTree(data ?? []), [data]);

  async function handleDelete(permission: ManagedPermission) {
    await deletePermission(permission.id);
    await reload();
  }

  return { permissions, isLoading, loadError: error, handleDelete };
}
