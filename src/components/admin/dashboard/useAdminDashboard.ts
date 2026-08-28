"use client";

import { useEffect, useState } from "react";

import { listProducts } from "@/features/products";
import { listRoles } from "@/features/roles";
import { listUsers } from "@/features/users";

type DashboardStats = {
  productCount: number;
  userCount: number;
  roleCount: number;
};

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([listProducts(), listUsers(), listRoles()]).then(
      ([products, users, roles]) => {
        if (isCancelled) {
          return;
        }

        setStats({
          productCount: products.length,
          userCount: users.length,
          roleCount: roles.length,
        });

        setIsLoading(false);
      },
    );

    return () => {
      isCancelled = true;
    };
  }, []);

  return { stats, isLoading };
}
