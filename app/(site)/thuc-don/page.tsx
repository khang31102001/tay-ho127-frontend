import { Fragment, type ReactNode } from "react";

import { listPageSlots, loadSlotContents, orderBlockKeys } from "@/features/content/public";
// Import các thành phần trang thực đơn từ feature menu.
import {
  MenuHero,
  MenuGrid,
  fetchMenu,
  type MenuResponse,
} from "@/features/catalog/menu";
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
  const [resp, slots]: [MenuResponse, Awaited<ReturnType<typeof listPageSlots>>] = await Promise.all([
    fetchMenu(),
    listPageSlots("thuc-don"),
  ]);
  const groups = resp?.data?.menu?.groups || [];
  const contents = await loadSlotContents(slots);
  const hero = contents.get("hero");

  const blockByKey: Record<string, ReactNode> = {
    hero: hero?.heading && <MenuHero content={hero} />,
    menu: <MenuGrid groups={groups} />,
  };

  return (
    <>
      {orderBlockKeys(slots, ["menu"]).map((key) => (
        <Fragment key={key}>{blockByKey[key]}</Fragment>
      ))}
    </>
  );
}
