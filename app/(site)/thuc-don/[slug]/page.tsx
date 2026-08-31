import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail, getProductDetail } from "@/features/menu";
import { buildMetadata } from "@/lib/seo/build-metadata";
import { resolveSeoPayload } from "@/lib/seo/resolve-seo-payload";

type ProductDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const seoPayload = await resolveSeoPayload({
    // TEMPORARY CONTRACT: endpoint đề xuất cho khi có Backend ASP.NET Core thật.
    endpoint: `/products/${params.slug}/seo`,
    mockResolver: async () => {
      const data = await getProductDetail(params.slug);
      if (!data) return null;

      return {
        title: data.product.name,
        description: data.product.description ?? `Đặt món ${data.product.name} tại Bánh Cuốn Tây Hồ 127.`,
        path: `/thuc-don/${params.slug}`,
        image: data.product.image,
      };
    },
  });

  if (!seoPayload) {
    return buildMetadata({
      title: "Không tìm thấy món ăn",
      description: "Món ăn này không tồn tại hoặc đã ngừng bán.",
      path: `/thuc-don/${params.slug}`,
      noindex: true,
    });
  }

  return buildMetadata(seoPayload);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const data = await getProductDetail(params.slug);

  if (!data) {
    notFound();
  }

  return <ProductDetail data={data} />;
}
