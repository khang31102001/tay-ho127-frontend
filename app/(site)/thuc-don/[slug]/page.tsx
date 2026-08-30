import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail, getProductDetail } from "@/features/menu";

type ProductDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const data = await getProductDetail(params.slug);

  if (!data) {
    return { title: "Không tìm thấy món ăn | Bánh Cuốn Tây Hồ 127" };
  }

  return {
    title: `${data.product.name} | Bánh Cuốn Tây Hồ 127`,
    description:
      data.product.description ??
      `Đặt món ${data.product.name} tại Bánh Cuốn Tây Hồ 127.`,
  };
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
