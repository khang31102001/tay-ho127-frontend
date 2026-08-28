// Import các thành phần trang thực đơn từ feature menu.
import {
  MenuHero,
  MenuGrid,
  fetchMenu,
  FloatingCartBar,
  type MenuResponse,
} from "@/features/menu";

// Metadata riêng cho trang thực đơn.
export const metadata = {
  // Tiêu đề SEO cho trang menu.
  title: "Thực đơn | Bánh Cuốn Tây Hồ 127",
  // Mô tả SEO ngắn cho trang menu.
  description: "Thực đơn bánh cuốn, món thêm và đồ uống của Bánh Cuốn Tây Hồ 127.",
};

// Trang thực đơn: layout thứ hai theo yêu cầu.
export default async function MenuPage() {
  // Render page menu bằng component tái sử dụng.
    const resp: MenuResponse = await fetchMenu();
  const groups = resp?.data?.menu?.groups || [];
  return (
    <>
      <MenuHero />

      <MenuGrid groups={groups} />
      <FloatingCartBar />
      {/* <CTASection /> */}
    </>
  );
}
