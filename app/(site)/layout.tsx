// Import Footer dùng chung cho mọi trang khách hàng.
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/provider/app-providers";
import { LoadingProvider } from "@/provider/loading-provider";
import FloatingActions from "@/components/layout/FloatingActions";
import { JsonLd } from "@/components/shared/JsonLd";
// Import thẳng service (không qua barrel @/features/seo) — cùng lý do
// navigationApi bên dưới (barrel re-export cả UI Admin).
import { resolveGlobalSchemas } from "@/features/seo/services/seo-schema-resolver.service";
// Import thẳng navigationApi (không qua barrel @/features/navigation) —
// barrel đó re-export cả Explorer/Editor/Tree admin (UI "use client"), import
// qua barrel ở đây sẽ kéo UI admin vào bundle Site. Lý do đầy đủ xem
// src/features/menu/services/menu.service.ts.
import { navigationApi } from "@/features/navigation/api/navigation.api";

interface SiteLayoutProps {
  children: React.ReactNode;
}

// SiteLayout bọc mọi trang User Site (/, /thuc-don, /checkout, /menu) để giữ
// header/footer/cart nhất quán, tách biệt khỏi Admin Portal ở app/admin.
// LoadingProvider cấp Global Loading State (useGlobalLoading) cho toàn bộ
// User Site — tách khỏi AppProviders vì đây là infra dùng chung, không phải
// business feature như Cart.
//
// Header/Footer nav lấy động từ Navigation module (features/navigation) —
// fetch ở đây (Server Component) làm giá trị khởi tạo nhanh (SSR, không nháy
// lần đầu) rồi truyền xuống qua prop; Header/Footer tự refetch lại 1 lần khi
// mount (useLiveNavigation) để đồng bộ thay đổi Admin vừa lưu trong CÙNG
// session — xem chú thích trong hook đó để biết lý do (mock dùng localStorage,
// Server Component không đọc được).
export default async function SiteLayout({ children }: SiteLayoutProps) {
  const [headerMenu, footerMenu, globalSchemas] = await Promise.all([
    navigationApi.getByLocation("header"),
    navigationApi.getByLocation("footer"),
    // GLOBAL SCHEMA (Task 9): Organization + Restaurant + WebSite, render 1 lần
    // duy nhất cho toàn bộ User Site — không lặp lại ở từng page con.
    resolveGlobalSchemas(),
  ]);

  return (
    <LoadingProvider>
      <AppProviders>
        <JsonLd data={globalSchemas} />

        <div className="flex min-h-svh flex-col">
          <Header variant="dark" navItems={headerMenu?.items ?? []} />

          <main className="min-h-0 flex-1">
            {children}
          </main>

          <Footer navItems={footerMenu?.items ?? []} />
        </div>
        <FloatingActions />
      </AppProviders>
    </LoadingProvider>
  );
}
