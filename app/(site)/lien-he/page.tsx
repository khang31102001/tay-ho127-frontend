import type { Metadata } from "next";

import { ContactInfoCard, ContactMap } from "@/features/contact";
import { NewsHero } from "@/features/content/news";
import { getSiteUrl } from "@/core/config/site-url";
import { site } from "@/core/config/site-data";
// Import thẳng service (không qua barrel @/features/organization/brand-profile) — barrel đó re-export UI Admin.
import { getSiteBrand } from "@/features/organization/brand-profile/services/brand-public.service";
import { formatBrandAddress } from "@/features/organization/brand-profile/utils/site-contact";
import { buildMetadata } from "@/features/seo/utils/build-metadata";
import { buildBreadcrumbListSchema } from "@/features/seo/utils/schema-generators";
import { Container } from "@/shared/ui/Container";
import { JsonLd } from "@/shared/components/JsonLd";

const PATH = "/lien-he";

/** Mô tả ghép từ địa chỉ chi nhánh chính (Admin nhập) — không ghi cứng địa chỉ vào code. */
function buildContactDescription(brandName: string, address: string): string {
  const location = address ? ` tại ${address}` : "";
  return `Địa chỉ, giờ mở cửa, số điện thoại và bản đồ đường đến ${brandName}${location}. Gọi đặt bàn, nhắn Zalo hoặc đặt món trên ShopeeFood.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getSiteBrand();
  return buildMetadata({
    title: "Liên hệ & chỉ đường",
    description: buildContactDescription(brand.name, formatBrandAddress(brand)),
    path: PATH,
    image: site.assets.dishPhoto,
  });
}

export default async function ContactPage() {
  const brand = await getSiteBrand();
  const siteUrl = getSiteUrl();
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: `Liên hệ ${brand.name}`,
      description: buildContactDescription(brand.name, formatBrandAddress(brand)),
      url: `${siteUrl}${PATH}`,
    },
    buildBreadcrumbListSchema(siteUrl, [
      { name: "Trang chủ", path: "/" },
      { name: "Liên hệ", path: PATH },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <NewsHero
        badge="Liên hệ"
        title="Liên hệ & chỉ đường"
        description="Ghé quán ăn sáng, gọi đặt bàn hoặc đặt món mang về: mọi thông tin để tìm tới Bánh Cuốn Tây Hồ 127."
      />

      <section className="section-padding bg-brand-cream">
        <Container>
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:gap-8">
            <ContactInfoCard brand={brand} />
            <ContactMap brand={brand} />
          </div>
        </Container>
      </section>
    </>
  );
}
