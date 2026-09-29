import { AdminDashboardShell } from "@/components/admin/layout/AdminDashboardShell";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

// Chrome dashboard (sidebar + header) + guard, áp dụng cho mọi trang quản lý domain.
// Sidebar lấy menu theo quyền từ Backend ở phía client (cần phiên đăng nhập của admin).
export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
