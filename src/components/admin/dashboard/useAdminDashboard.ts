"use client";

import { listProducts } from "@/features/products";
import { countRoles } from "@/features/roles";
import { countUsers } from "@/features/users";
import { useAsyncData } from "@/hooks/useAsyncData";

type DashboardStats = {
  productCount: number | null;
  userCount: number | null;
  roleCount: number | null;
};

const valueOrNull = (result: PromiseSettledResult<number>) => (result.status === "fulfilled" ? result.value : null);

/**
 * Mỗi số liệu tải độc lập: admin không có quyền xem người dùng/vai trò (403)
 * vẫn thấy các số liệu còn lại — số liệu lỗi hiển thị "—".
 */
async function loadDashboardStats(): Promise<DashboardStats> {
  const [productCount, userCount, roleCount] = await Promise.allSettled([
    listProducts().then((products) => products.length),
    countUsers(),
    countRoles(),
  ]);

  return { productCount: valueOrNull(productCount), userCount: valueOrNull(userCount), roleCount: valueOrNull(roleCount) };
}

export function useAdminDashboard() {
  const { data, isLoading } = useAsyncData(loadDashboardStats, []);
  return { stats: data ?? null, isLoading };
}
