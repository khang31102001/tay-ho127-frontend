import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail, getProductDetail } from "@/features/menu";
import { buildMetadata } from "@/lib/seo/build-metadata";
import { resolveSeoPayload } from "@/lib/seo/resolve-seo-payload";
import { resolveSeoPayloadForEntity } from "@/features/seo/services/seo-resolver.service";
import { resolveProductPageSchemas } from "@/features/seo/services/seo-schema-resolver.service";
import { JsonLd } from "@/components/shared/JsonLd";

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

      // Site chỉ đọc catalog public — product.service (Admin, cần phiên đăng nhập) không dùng được ở đây.
      return resolveSeoPayloadForEntity({
        entityType: "product",
        entityId: params.slug,
        path: `/thuc-don/${params.slug}`,
        defaults: {
          title: data.product.name,
          description: data.product.description ?? `Đặt món ${data.product.name} tại Bánh Cuốn Tây Hồ 127.`,
          imageMediaId: null,
        },
        entityImageUrl: data.product.image,
      });
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

  // PAGE SCHEMA (Task 20): Product + Offer (lồng bên trong) + BreadcrumbList.
  const schemas = await resolveProductPageSchemas({
    entityId: params.slug,
    name: data.product.name,
    description: data.product.description,
    imageUrl: data.product.image,
    price: data.product.price,
    path: `/thuc-don/${params.slug}`,
    breadcrumb: [
      { name: "Trang chủ", path: "/" },
      { name: "Thực đơn", path: "/thuc-don" },
      { name: data.product.name, path: `/thuc-don/${params.slug}` },
    ],
  });

  return (
    <>
      <JsonLd data={schemas} />
      <ProductDetail data={data} />
    </>
  );
}
