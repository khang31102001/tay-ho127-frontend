"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AppInitLoading } from "@/components/shared/loading/AppInitLoading";
import { site } from "@/data/site";
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

  const isReady = isAuthLoaded && !!user;

  // AppInitLoading nằm cạnh children (không thay thế) để tự fade-out mượt khi ready.
  return (
    <>
      {isReady && children}
      <AppInitLoading isReady={isReady} logoSrc={site.assets.logoColor} title="Quản trị Tây Hồ 127" />
    </>
  );
}
