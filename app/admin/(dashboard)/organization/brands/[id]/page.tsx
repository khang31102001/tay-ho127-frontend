import { BrandEditor } from "@/features/organization";

interface AdminBrandEditPageProps {
  params: { id: string };
}

export default function AdminBrandEditPage({ params }: AdminBrandEditPageProps) {
  return <BrandEditor id={params.id} />;
}
