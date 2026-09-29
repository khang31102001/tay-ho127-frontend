"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import { listUsers } from "../services/user.service";

export function useUsersExplorer() {
  const { data, isLoading, error } = useAsyncData(listUsers, [], {
    fallbackError: "Không thể tải danh sách người dùng.",
  });

  return { users: data ?? [], isLoading, loadError: error };
}
