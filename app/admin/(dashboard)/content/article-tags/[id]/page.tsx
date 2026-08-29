import { ArticleTagEditor } from "@/features/article-tags";

interface AdminArticleTagEditPageProps {
  params: { id: string };
}

export default function AdminArticleTagEditPage({ params }: AdminArticleTagEditPageProps) {
  return <ArticleTagEditor id={params.id} />;
}
