"use client";

import { useEffect, useState, type ReactNode } from "react";

import { AdminGuard } from "./AdminGuard";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "tayho-admin-sidebar-collapsed";

type AdminDashboardShellProps = {
  children: ReactNode;
};

/**
 * Giữ state thu gọn sidebar desktop (lưu localStorage) và mở/đóng của mobile nav drawer — cần "use client" vì AdminSidebar
 * (drawer) và AdminHeader (nút hamburger) là 2 component độc lập cần chia sẻ
 * chung 1 state. Sidebar tự tải menu theo quyền từ Backend (sau AdminGuard).
 */
export function AdminDashboardShell({ children }: AdminDashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Đọc sau mount (không đọc trong initial state) để tránh lệch hydration SSR.
  useEffect(() => {
    try {
      setIsSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1");
    } catch {
      // Storage bị chặn: dùng mặc định mở rộng.
    }
  }, []);

  function handleToggleSidebar() {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Không lưu được thì chỉ mất ghi nhớ giữa các lần tải trang.
    }
  }

  return (
    <AdminGuard>
      <div className="flex min-h-svh bg-[#fafaf8]">
        <AdminSidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* min-w-0: cột nội dung được phép co lại, bảng rộng không đẩy trang ra horizontal scroll. */}
        <div className="flex min-h-svh min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setIsMobileNavOpen(true)} />

          <main className="flex-1 px-5 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
