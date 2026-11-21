// Import các thành phần trang thực đơn từ feature menu.
import {
  MenuHero,
  MenuGrid,
  fetchMenu,
  fetchFeaturedMenu,
} from "@/features/catalog/menu";
import { buildMetadata } from "@/features/seo/utils/build-metadata";

// Metadata riêng cho trang thực đơn — dữ liệu tĩnh nên build trực tiếp, không cần generateMetadata.
export const metadata = buildMetadata({
  title: "Thực đơn",
  description: "Thực đơn bánh cuốn, món thêm và đồ uống của Bánh Cuốn Tây Hồ 127.",
  path: "/thuc-don",
});

// Trang thực đơn: layout thứ hai theo yêu cầu.
export default async function MenuPage() {
  // Render page menu bằng component tái sử dụng.
  const [resp, featured] = await Promise.all([fetchMenu(), fetchFeaturedMenu()]);
  const groups = resp?.data?.menu?.groups || [];
  return (
    <>
      <MenuHero />

      <MenuGrid groups={groups} featured={featured} />
      {/* <CTASection /> */}
    </>
  );
}
