import { ArticleEditor } from "@/features/articles";

interface AdminArticleEditPageProps {
  params: { id: string };
}

export default function AdminArticleEditPage({ params }: AdminArticleEditPageProps) {
  return <ArticleEditor id={params.id} />;
}
