"use client";

import { useState, type ReactNode } from "react";

import type { NavigationItem } from "@/features/navigation";

import { AdminGuard } from "./AdminGuard";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminDashboardShellProps = {
  children: ReactNode;
  /** Fetch ở app/admin/(dashboard)/layout.tsx (Server Component), truyền xuống AdminSidebar. */
  navigationItems: NavigationItem[];
};

/**
 * Giữ state mở/đóng của mobile nav drawer — cần "use client" vì AdminSidebar
 * (drawer) và AdminHeader (nút hamburger) là 2 component độc lập cần chia sẻ
 * chung 1 state.
 */
export function AdminDashboardShell({ children, navigationItems }: AdminDashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-svh bg-[#fafaf8]">
        <AdminSidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          navigationItems={navigationItems}
        />

        <div className="flex min-h-svh flex-1 flex-col">
          <AdminHeader onMenuClick={() => setIsMobileNavOpen(true)} />

          <main className="flex-1 px-5 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
