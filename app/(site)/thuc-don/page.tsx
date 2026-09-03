// Import các thành phần trang thực đơn từ feature menu.
import {
  MenuHero,
  MenuGrid,
  fetchMenu,
  type MenuResponse,
} from "@/features/menu";
import { buildMetadata } from "@/lib/seo/build-metadata";

// Metadata riêng cho trang thực đơn — dữ liệu tĩnh nên build trực tiếp, không cần generateMetadata.
export const metadata = buildMetadata({
  title: "Thực đơn",
  description: "Thực đơn bánh cuốn, món thêm và đồ uống của Bánh Cuốn Tây Hồ 127.",
  path: "/thuc-don",
});

// Trang thực đơn: layout thứ hai theo yêu cầu.
export default async function MenuPage() {
  // Render page menu bằng component tái sử dụng.
    const resp: MenuResponse = await fetchMenu();
  const groups = resp?.data?.menu?.groups || [];
  return (
    <>
      <MenuHero />

      <MenuGrid groups={groups} />
      {/* <CTASection /> */}
    </>
  );
}
