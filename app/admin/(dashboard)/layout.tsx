import { AdminDashboardShell } from "@/components/admin/layout/AdminDashboardShell";
// Import thẳng navigationApi (không qua barrel @/features/navigation) — lý
// do xem app/(site)/layout.tsx. Ở đây tuy đã trong bundle Admin nên không
// bắt buộc, nhưng giữ nhất quán 1 chỗ import duy nhất cho navigationApi.
import { navigationApi } from "@/features/navigation/api/navigation.api";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

// Chrome dashboard (sidebar + header) + guard, áp dụng cho mọi trang quản lý domain.
// Sidebar nav lấy động từ Navigation module — fetch ở đây (Server Component)
// rồi truyền xuống qua AdminDashboardShell, không hard-code ADMIN_NAV_SECTIONS nữa.
export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const sidebarMenu = await navigationApi.getByLocation("admin-sidebar");

  return (
    <AdminDashboardShell navigationItems={sidebarMenu?.items ?? []}>{children}</AdminDashboardShell>
  );
}
