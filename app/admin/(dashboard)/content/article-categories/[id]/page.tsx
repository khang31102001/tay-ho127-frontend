import { ArticleCategoryEditor } from "@/features/content/article-categories";

interface AdminArticleCategoryEditPageProps {
  params: { id: string };
}

export default function AdminArticleCategoryEditPage({ params }: AdminArticleCategoryEditPageProps) {
  return <ArticleCategoryEditor id={params.id} />;
}
