// Import CSS font-face local trước để các biến font có hiệu lực sớm.
// @ts-ignore: side-effect CSS import may not have type declarations in this setup
import "@/styles/fonts.css";
// Import token màu/font tập trung cho toàn bộ website.s.
// @ts-ignore: side-effect CSS import may not have type declarations in this setup
import "@/styles/tokens.css";
// Import Tailwind layer và reset global.
// @ts-ignore: side-effect CSS import may not have type declarations in this setup
import "./globals.css";
// Import class component dùng chung sau Tailwind để @apply hoạt động đúng.
// @ts-ignore: side-effect CSS import may not have type declarations in this setup
import "@/styles/components.css";
// Import Navbar dùng chung cho mọi trang.
import { Navbar } from "@/components/layout/Navbar";
// Import Footer dùng chung cho mọi trang.
import { Footer } from "@/components/layout/Footer";
// Import thông tin site tập trung từ data.
import { site } from "@/data/site";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/provider/app-providers";
import FloatingActions from "@/components/layout/floating-actions";


// Metadata SEO cơ bản của Next.js App Router.
export const metadata = {
  // Tiêu đề mặc định của website.
  title: `${site.name} | Bánh cuốn truyền thống`,
  // Mô tả ngắn hiển thị cho công cụ tìm kiếm.
  description: site.tagline,
  // Icon tab browser dùng logo màu nếu muốn thay favicon sau này.
  icons: {
    // Đường dẫn favicon placeholder; bạn có thể thay bằng /favicon.ico.
    icon: "/images/logo-color.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}
// RootLayout bọc tất cả page để giữ header/footer nhất quán.
export default function RootLayout({ children }: RootLayoutProps) {
  // Trả về cấu trúc HTML chính của Next.js.
  return (
    <html lang="vi">
      <body className="min-h-svh">
        <AppProviders>
          <div className="flex min-h-svh flex-col">
            <Header variant="light" />

            <main className="min-h-0 flex-1 snap-y snap-proximity">
              {children}
            </main>

            <Footer />
          </div>
          <FloatingActions />
        </AppProviders>
      </body>
    </html>
  );
}
