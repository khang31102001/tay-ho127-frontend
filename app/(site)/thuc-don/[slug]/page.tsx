import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail, getProductDetail } from "@/features/menu";
// Import thẳng service (không qua barrel @/features/products) — barrel đó
// re-export cả UI Admin (ProductsExplorer/ProductEditor), cùng lý do đã áp
// dụng cho @/features/articles ở app/(site)/bai-viet/page.tsx.
import { getProductById } from "@/features/products/services/product.service";
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

      // Product.id chính là slug (không có field slug riêng — xem database-analysis.md).
      const rawProduct = await getProductById(params.slug);

      return resolveSeoPayloadForEntity({
        entityType: "product",
        entityId: params.slug,
        path: `/thuc-don/${params.slug}`,
        defaults: {
          title: data.product.name,
          description: data.product.description ?? `Đặt món ${data.product.name} tại Bánh Cuốn Tây Hồ 127.`,
          imageMediaId: rawProduct?.mediaIds[0] ?? null,
        },
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
