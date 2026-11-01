import { AboutMichelin, AboutSignatureDish, AboutTimeline } from "@/features/about";
import { NewsHero } from "@/features/content/news";
import { getSiteUrl } from "@/core/config/site-url";
import { site } from "@/core/config/site-data";
import { buildMetadata } from "@/features/seo/utils/build-metadata";
import { buildBreadcrumbListSchema } from "@/features/seo/utils/schema-generators";
import { JsonLd } from "@/shared/components/JsonLd";

const PATH = "/gioi-thieu";
const DESCRIPTION =
  "Bánh Cuốn Tây Hồ 127: tiệm bánh cuốn mở từ năm 1961 cạnh đền thờ cụ Phan Châu Trinh, nay ở 127 Đinh Tiên Hoàng, TP. Hồ Chí Minh. MICHELIN Bib Gourmand 2026.";

export const metadata = buildMetadata({
  title: "Giới thiệu – Câu chuyện từ năm 1961",
  description: DESCRIPTION,
  path: PATH,
  image: site.assets.dishPhoto,
});

export default function AboutPage() {
  const siteUrl = getSiteUrl();
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `Giới thiệu ${site.name}`,
      description: DESCRIPTION,
      url: `${siteUrl}${PATH}`,
    },
    buildBreadcrumbListSchema(siteUrl, [
      { name: "Trang chủ", path: "/" },
      { name: "Giới thiệu", path: PATH },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <NewsHero
        badge="Về Tây Hồ 127"
        title="Câu chuyện Bánh Cuốn Tây Hồ"
        description="Hơn 60 năm, ba thế hệ một gia đình giữ nghề bánh cuốn giữa Sài Gòn, từ tiệm nhỏ cạnh đền thờ cụ Phan Châu Trinh đến danh hiệu MICHELIN Bib Gourmand."
      />
      <AboutTimeline />
      <AboutSignatureDish />
      <AboutMichelin />
    </>
  );
}
