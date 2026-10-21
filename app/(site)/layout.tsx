// Import Footer dùng chung cho mọi trang khách hàng.
import { Footer } from "@/layout/site/Footer";
import { Header } from "@/layout/site/Header";
import { AppProviders } from "@/providers/app-providers";
import { LoadingProvider } from "@/providers/loading-provider";
import FloatingActions from "@/layout/site/FloatingActions";
import { NavigationOverlay } from "@/shared/components/loading/NavigationOverlay";
import { JsonLd } from "@/shared/components/JsonLd";
// Import thẳng service (không qua barrel @/features/seo) — cùng lý do
// navigationApi bên dưới (barrel re-export cả UI Admin).
import { resolveGlobalSchemas } from "@/features/seo/services/seo-schema-resolver.service";
// Import thẳng service (không qua barrel @/features/navigation) — barrel đó
// re-export cả Explorer/Editor/Tree admin (UI "use client"), import qua barrel
// ở đây sẽ kéo UI admin vào bundle Site. Lý do đầy đủ xem
// src/features/menu/services/menu.service.ts.
import { getPublicNavigation } from "@/features/navigation/services/public-navigation.service";
// Thương hiệu + liên hệ chi nhánh chính từ Backend (server-only) — cùng lý do import thẳng service như trên.
import { getSiteBrand } from "@/features/organization/brand-profile/services/brand-public.service";

// Layout này gọi Backend (menu, thương hiệu, schema) bằng BACKEND_API_URL — biến chỉ có lúc CHẠY, không có lúc
// `next build` (CI/Docker). Nếu để Next prerender lúc build, getPublicNavigation()/getSiteBrand() lỗi → trả về rỗng/mặc
// định và trang bị đóng băng thành file tĩnh (Cache-Control s-maxage=1 năm), Admin sửa menu cũng không bao giờ hiện.
// force-dynamic: luôn render lúc có request, khi Backend đã sẵn sàng.
export const dynamic = "force-dynamic";

interface SiteLayoutProps {
  children: React.ReactNode;
}

// SiteLayout bọc mọi trang User Site (/, /thuc-don, /checkout, /menu) để giữ
// header/footer/cart nhất quán, tách biệt khỏi Admin Portal ở app/admin.
// LoadingProvider cấp Global Loading State (useGlobalLoading) cho toàn bộ
// User Site — tách khỏi AppProviders vì đây là infra dùng chung, không phải
// business feature như Cart.
//
// Header/Footer nav lấy động từ Backend (module Navigation, menu Website công
// khai) — fetch ở đây (Server Component, cache 60 giây) rồi truyền xuống qua
// prop: Admin sửa menu thì Site thấy trong tối đa 60 giây.
export default async function SiteLayout({ children }: SiteLayoutProps) {
  const [headerItems, footerItems, brand, globalSchemas] = await Promise.all([
    getPublicNavigation("header"),
    getPublicNavigation("footer"),
    // Địa chỉ / SĐT / giờ mở cửa / link MXH hiển thị ở Footer và nút nổi — Admin sửa ở Tổ chức → Thông tin thương hiệu / Chi nhánh.
    getSiteBrand(),
    // GLOBAL SCHEMA (Task 9): Organization + Restaurant + WebSite, render 1 lần
    // duy nhất cho toàn bộ User Site — không lặp lại ở từng page con.
    resolveGlobalSchemas(),
  ]);

  return (
    <LoadingProvider>
      <AppProviders>
        <JsonLd data={globalSchemas} />

        <div className="flex min-h-svh flex-col">
          <Header variant="dark" navItems={headerItems} />

          <main className="relative min-h-0 flex-1">
            {children}
            <NavigationOverlay />
          </main>

          <Footer navItems={footerItems} brand={brand} />
        </div>
        <FloatingActions brand={brand} />
      </AppProviders>
    </LoadingProvider>
  );
}
