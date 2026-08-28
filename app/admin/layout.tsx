import { AdminAuthProvider } from "@/features/admin-auth";
import { LoadingProvider } from "@/provider/loading-provider";

export const metadata = {
  title: "Quản trị | Bánh Cuốn Tây Hồ 127",
  description: "Khu vực quản trị Bánh Cuốn Tây Hồ 127.",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Layout gốc cho toàn bộ /admin/*, bao gồm cả trang login lẫn dashboard.
// Cấp AdminAuthProvider — sidebar/header/guard nằm ở app/admin/(dashboard)/layout.tsx
// vì trang login không cần chrome đó. LoadingProvider cấp Global Loading State
// riêng cho Admin Portal (cùng cơ chế với User Site, xem app/(site)/layout.tsx).
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <LoadingProvider>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </LoadingProvider>
  );
}
