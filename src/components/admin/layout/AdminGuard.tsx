"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/features/admin-auth";

type AdminGuardProps = {
  children: ReactNode;
};

// Chặn truy cập /admin/(dashboard)/* khi chưa đăng nhập.
// Chờ isAuthLoaded để tránh redirect nhầm trước khi kịp đọc localStorage.
export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthLoaded } = useAdminAuth();

  useEffect(() => {
    if (isAuthLoaded && !user) {
      router.replace("/admin/login");
    }
  }, [isAuthLoaded, user, router]);

  if (!isAuthLoaded || !user) {
    return null;
  }

  return <>{children}</>;
}
