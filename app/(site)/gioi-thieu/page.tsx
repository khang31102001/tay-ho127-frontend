import { Fragment, type ReactNode } from "react";

import { AboutMichelin, AboutSignatureDish, AboutTimeline } from "@/features/about";
import { listPageSlots, loadSlotContents, orderBlockKeys } from "@/features/content/public";
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

/**
 * Trang Giới thiệu = các ô theo thứ tự Admin sắp (Admin → Nội dung → Trang → Giới thiệu → Sections, mã trang
 * "gioi-thieu"). Ô ẩn / chưa có / thiếu tiêu đề thì không hiển thị.
 */
export default async function AboutPage() {
  const slots = await listPageSlots("gioi-thieu");
  const contents = await loadSlotContents(slots);
  const hero = contents.get("hero");
  const timeline = contents.get("timeline");
  const signatureDish = contents.get("signature-dish");
  const michelin = contents.get("michelin");

  const blockByKey: Record<string, ReactNode> = {
    hero: hero?.heading && (
      <NewsHero badge={hero.eyebrow} title={hero.heading} description={hero.paragraphs.join(" ")} />
    ),
    timeline: timeline && <AboutTimeline content={timeline} />,
    "signature-dish": signatureDish?.heading && <AboutSignatureDish content={signatureDish} />,
    michelin: michelin?.heading && <AboutMichelin content={michelin} />,
  };

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
      {orderBlockKeys(slots).map((key) => (
        <Fragment key={key}>{blockByKey[key]}</Fragment>
      ))}
    </>
  );
}
