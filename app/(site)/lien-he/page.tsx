import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";

import { fetchFeaturedMenu } from "@/features/catalog/menu";
import { listPageSlots, loadSlotContents, orderBlockKeys } from "@/features/content/public";
import {
  ContactFaq,
  ContactFeaturedDishes,
  ContactHero,
  ContactInfoCard,
  ContactMap,
  ContactVisitIntro,
  buildContactFaq,
} from "@/features/contact";
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
const FEATURED_DISH_LIMIT = 4;

/** Mô tả ghép từ địa chỉ chi nhánh chính (Admin nhập) — không ghi cứng địa chỉ vào code. */
function buildContactDescription(brandName: string, address: string): string {
  const location = address ? ` tại ${address}` : "";
  return `Địa chỉ, giờ mở cửa, số điện thoại và bản đồ đường đến ${brandName}${location}. Gọi đặt bàn, nhắn Zalo hoặc đặt món trên ShopeeFood.`;
}

/** Title chứa địa điểm như các trang địa điểm F&B ("Liên hệ & chỉ đường: 127 Đinh Tiên Hoàng, Tân Định"). */
function buildContactTitle(addressLine: string, ward?: string): string {
  const location = [addressLine, ward].map((part) => part?.trim()).filter(Boolean).join(", ");
  return location ? `Liên hệ & chỉ đường: ${location}` : "Liên hệ & chỉ đường";
}

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getSiteBrand();
  return buildMetadata({
    title: buildContactTitle(brand.addressLine, brand.ward),
    description: buildContactDescription(brand.name, formatBrandAddress(brand)),
    path: PATH,
    image: site.assets.dishPhoto,
  });
}

export default async function ContactPage() {
  const [brand, menuItems, slots] = await Promise.all([getSiteBrand(), fetchFeaturedMenu(), listPageSlots("lien-he")]);
  const contents = await loadSlotContents(slots);
  const siteUrl = getSiteUrl();
  const address = formatBrandAddress(brand);
  const featuredDishes = menuItems.slice(0, FEATURED_DISH_LIMIT);
  // Giá thấp nhất trong đúng các món đang hiển thị ở khối "Món được gọi nhiều nhất" — Menu-SP "mon-yeu-thich" còn có
  // món phụ vài nghìn đồng, lấy cả danh sách sẽ ra câu trả lời sai.
  const lowestPrice = featuredDishes.length > 0 ? Math.min(...featuredDishes.map((item) => item.price)) : null;
  const hero = contents.get("hero");
  const visitIntro = contents.get("visit-intro");
  const featuredDishesContent = contents.get("featured-dishes");
  const faq = contents.get("faq");
  // Câu hỏi sinh từ dữ liệu (địa chỉ/giờ/giá) trước, câu Admin thêm ở ô "faq" sau.
  const faqItems = [
    ...buildContactFaq(brand, lowestPrice),
    ...(faq?.items ?? []).filter((item) => item.title && item.text).map((item) => ({ question: item.title, answer: item.text })),
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: `Liên hệ ${brand.name}`,
      description: buildContactDescription(brand.name, address),
      url: `${siteUrl}${PATH}`,
    },
    buildBreadcrumbListSchema(siteUrl, [
      { name: "Trang chủ", path: "/" },
      { name: "Liên hệ", path: PATH },
    ]),
  ];

  /**
   * Trang Liên hệ = các ô theo thứ tự Admin sắp (mã trang "lien-he"). Thông tin liên hệ + bản đồ là khối lõi — luôn
   * hiển thị; tên quán, địa chỉ, giờ, SĐT lấy từ Thông tin thương hiệu / Chi nhánh, không từ section.
   */
  const blockByKey: Record<string, ReactNode> = {
    hero: hero && <ContactHero brand={brand} badge={hero.eyebrow} />,
    "contact-info": (
      <section className="section-padding bg-brand-cream">
        <Container>
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:gap-8">
            <ContactInfoCard brand={brand} />
            <ContactMap brand={brand} />
          </div>
        </Container>
      </section>
    ),
    "visit-intro": visitIntro?.heading && (
      <ContactVisitIntro brandName={brand.name} address={address} content={visitIntro} />
    ),
    "featured-dishes": featuredDishesContent && (
      <ContactFeaturedDishes items={featuredDishes} content={featuredDishesContent} />
    ),
    faq: faq && <ContactFaq items={faqItems} eyebrow={faq.eyebrow} heading={faq.heading} />,
  };

  return (
    <>
      <JsonLd data={schemas} />
      {orderBlockKeys(slots, ["contact-info"]).map((key) => (
        <Fragment key={key}>{blockByKey[key]}</Fragment>
      ))}
    </>
  );
}
