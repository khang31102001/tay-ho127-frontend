"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import { listMenus } from "../services/navigation.service";

/** Các menu Website (header / footer / mobile) — container cố định, không thêm/xóa. */
export function useNavigationMenusExplorer() {
  const { data, isLoading, error } = useAsyncData(() => listMenus("site"), [], {
    fallbackError: "Không thể tải danh sách menu.",
  });

  return { rows: data ?? [], isLoading, loadError: error };
}
