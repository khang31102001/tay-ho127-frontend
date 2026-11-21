import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail, getProductDetail } from "@/features/catalog/menu";
import { buildMetadata } from "@/features/seo/utils/build-metadata";
import { resolveSeoPayloadForEntity } from "@/features/seo/services/seo-resolver.service";
import { resolveProductPageSchemas } from "@/features/seo/services/seo-schema-resolver.service";
import { HeaderBackdrop } from "@/shared/ui/HeaderBackdrop";
import { JsonLd } from "@/shared/components/JsonLd";

type ProductDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const data = await getProductDetail(params.slug);

  // Site chỉ đọc catalog public — product.service (Admin, cần phiên đăng nhập) không dùng được ở đây.
  // Override SEO khóa theo id sản phẩm (không theo slug) để đổi slug không làm mất override.
  const seoPayload = data
    ? await resolveSeoPayloadForEntity({
        entityType: "product",
        entityId: data.product.id,
        path: `/thuc-don/${params.slug}`,
        defaults: {
          title: data.product.name,
          description: data.product.description ?? `Đặt món ${data.product.name} tại Bánh Cuốn Tây Hồ 127.`,
          imageMediaId: null,
        },
        entityImageUrl: data.product.image,
      })
    : null;

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
    entityId: data.product.id,
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
      <HeaderBackdrop />
      <JsonLd data={schemas} />
      <ProductDetail data={data} />
    </>
  );
}
