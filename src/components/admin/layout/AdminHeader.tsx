"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth";

type AdminHeaderProps = {
  onMenuClick?: () => void;
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-brand-line bg-white px-5 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Mở menu quản trị"
          className="flex size-9 items-center justify-center rounded-lg text-brand-greenDark transition hover:bg-brand-green/10 md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <span className="text-[14px] font-bold text-brand-greenDark md:hidden">
          Quản trị Tây Hồ 127
        </span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-[14px] font-medium text-brand-ink">
          {user?.name}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Đăng xuất"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold text-brand-muted transition hover:bg-brand-red/10 hover:text-brand-red"
        >
          <LogOut className="size-4" />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
