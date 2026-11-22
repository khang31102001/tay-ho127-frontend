import { Fragment, type ReactNode } from "react";

import { listPageSlots, loadSlotContents, orderBlockKeys } from "@/features/content/public";
// Import các thành phần trang thực đơn từ feature menu.
import { MenuHero, MenuGrid, fetchMenuSections } from "@/features/catalog/menu";
import { buildMetadata } from "@/features/seo/utils/build-metadata";

// Metadata riêng cho trang thực đơn — dữ liệu tĩnh nên build trực tiếp, không cần generateMetadata.
export const metadata = buildMetadata({
  title: "Thực đơn",
  description: "Thực đơn bánh cuốn, món thêm và đồ uống của Bánh Cuốn Tây Hồ 127.",
  path: "/thuc-don",
});

/**
 * Trang Thực đơn = các ô theo thứ tự Admin sắp (mã trang "thuc-don"): hero do Admin quản lý, lưới thực đơn là khối
 * lõi — luôn hiển thị, Admin chỉ đổi vị trí.
 */
export default async function MenuPage() {
  // Mỗi thực đơn đang hoạt động (Admin → Catalog → Thực đơn) là một section.
  const [sections, slots] = await Promise.all([fetchMenuSections(), listPageSlots("thuc-don")]);
  const contents = await loadSlotContents(slots);
  const hero = contents.get("hero");

  const blockByKey: Record<string, ReactNode> = {
    hero: hero?.heading && <MenuHero content={hero} />,
    menu: <MenuGrid sections={sections} />,
  };

  return (
    <>
      {orderBlockKeys(slots, ["menu"]).map((key) => (
        <Fragment key={key}>{blockByKey[key]}</Fragment>
      ))}
    </>
  );
}
