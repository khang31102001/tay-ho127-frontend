"use client";

import { useAsyncData } from "@/hooks/useAsyncData";

import { getMySidebarMenu } from "../services/admin-menu.service";

/** Sidebar của admin đang đăng nhập — gọi sau khi AdminGuard xác nhận có phiên. */
export function useAdminSidebarMenu() {
  const { data, isLoading, error } = useAsyncData(getMySidebarMenu, [], {
    fallbackError: "Không thể tải menu quản trị.",
  });

  return { menuItems: data ?? [], isLoading, loadError: error };
}
