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
// Import thông tin site tập trung từ data.
import { site } from "@/data/site";

// Metadata SEO mặc định của Next.js App Router.
// (site) và admin có thể override qua metadata riêng ở layout con.
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
// RootLayout: chỉ giữ khung <html>/<body> + global CSS, dùng chung cho cả User Site và Admin Portal.
// Header/Footer/CartProvider của khách hàng nằm ở app/(site)/layout.tsx, không áp dụng cho /admin.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
