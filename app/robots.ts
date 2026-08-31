import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin: khu vực quản trị, không có giá trị index và không nên lộ ra kết quả tìm kiếm.
        // /checkout: luồng giao dịch + trang xác nhận đơn (chứa thông tin đơn hàng cá nhân), không index.
        disallow: ["/admin", "/checkout"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
