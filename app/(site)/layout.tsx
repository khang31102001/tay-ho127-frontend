// Import Footer dùng chung cho mọi trang khách hàng.
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/provider/app-providers";
import { LoadingProvider } from "@/provider/loading-provider";
import FloatingActions from "@/components/layout/FloatingActions";

interface SiteLayoutProps {
  children: React.ReactNode;
}

// SiteLayout bọc mọi trang User Site (/, /thuc-don, /checkout, /menu) để giữ
// header/footer/cart nhất quán, tách biệt khỏi Admin Portal ở app/admin.
// LoadingProvider cấp Global Loading State (useGlobalLoading) cho toàn bộ
// User Site — tách khỏi AppProviders vì đây là infra dùng chung, không phải
// business feature như Cart.
export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <LoadingProvider>
      <AppProviders>
        <div className="flex min-h-svh flex-col">
          <Header variant="dark" />

          <main className="min-h-0 flex-1">
            {children}
          </main>

          <Footer />
        </div>
        <FloatingActions />
      </AppProviders>
    </LoadingProvider>
  );
}
