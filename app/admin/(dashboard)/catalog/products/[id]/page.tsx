import { ProductEditor } from "@/features/catalog/products";

interface AdminProductEditPageProps {
  params: { id: string };
}

export default function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  return <ProductEditor id={params.id} />;
}
