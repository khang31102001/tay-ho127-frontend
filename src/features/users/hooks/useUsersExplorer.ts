"use client";

import { useCallback, useEffect, useState } from "react";

import type { ManagedUser } from "../types/user.types";
import { deleteUser, listUsers } from "../services/user.service";

export function useUsersExplorer() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listUsers();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleDelete(user: ManagedUser) {
    await deleteUser(user.id);
    await loadUsers();
  }

  return {
    users,
    isLoading,
    handleDelete,
  };
}
