import { CategoryEditor } from "@/features/catalog/categories";

interface AdminCategoryEditPageProps {
  params: { id: string };
}

export default function AdminCategoryEditPage({ params }: AdminCategoryEditPageProps) {
  return <CategoryEditor id={params.id} />;
}
