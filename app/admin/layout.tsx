// Bảng màu riêng của Admin (ghi đè token brand-*) — chỉ nạp khi vào /admin/*, User Site không tải file này.
// @ts-ignore: side-effect CSS import may not have type declarations in this setup
import "@/styles/admin-theme.css";

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
// `data-admin-theme` là dấu hiệu để src/styles/admin-theme.css đổi bảng màu; `contents` để wrapper không ảnh hưởng layout.
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div data-admin-theme className="contents">
      <LoadingProvider>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </LoadingProvider>
    </div>
  );
}
