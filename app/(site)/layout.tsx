// Import Footer dùng chung cho mọi trang khách hàng.
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/provider/app-providers";
import { LoadingProvider } from "@/provider/loading-provider";
import FloatingActions from "@/components/layout/FloatingActions";
import { NavigationOverlay } from "@/components/shared/loading/NavigationOverlay";
import { JsonLd } from "@/components/shared/JsonLd";
// Import thẳng service (không qua barrel @/features/seo) — cùng lý do
// navigationApi bên dưới (barrel re-export cả UI Admin).
import { resolveGlobalSchemas } from "@/features/seo/services/seo-schema-resolver.service";
// Import thẳng service (không qua barrel @/features/navigation) — barrel đó
// re-export cả Explorer/Editor/Tree admin (UI "use client"), import qua barrel
// ở đây sẽ kéo UI admin vào bundle Site. Lý do đầy đủ xem
// src/features/menu/services/menu.service.ts.
import { getPublicNavigation } from "@/features/navigation/services/public-navigation.service";

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
  const [headerItems, footerItems, globalSchemas] = await Promise.all([
    getPublicNavigation("header"),
    getPublicNavigation("footer"),
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

          <Footer navItems={footerItems} />
        </div>
        <FloatingActions />
      </AppProviders>
    </LoadingProvider>
  );
}
