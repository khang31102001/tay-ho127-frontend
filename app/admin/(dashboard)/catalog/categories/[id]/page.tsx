import { CategoryEditor } from "@/features/categories";

interface AdminCategoryEditPageProps {
  params: { id: string };
}

export default function AdminCategoryEditPage({ params }: AdminCategoryEditPageProps) {
  return <CategoryEditor id={params.id} />;
}
