"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedRole } from "../types/role.types";
import { deleteRole, listRoles } from "../services/role.service";

export function useRolesExplorer() {
  const [roles, setRoles] = useState<ManagedRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listRoles();
      setRoles(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  async function handleDelete(role: ManagedRole) {
    await deleteRole(role.id);
    await loadRoles();
  }

  return {
    roles,
    isLoading,
    handleDelete,
  };
}
