import { ArticleEditor } from "@/features/content/articles";

interface AdminArticleEditPageProps {
  params: { id: string };
}

export default function AdminArticleEditPage({ params }: AdminArticleEditPageProps) {
  return <ArticleEditor id={params.id} />;
}
