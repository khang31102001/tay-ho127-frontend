import { PageSectionEditor } from "@/features/page-sections";

interface AdminPageSectionCreatePageProps {
  params: { id: string };
}

export default function AdminPageSectionCreatePage({ params }: AdminPageSectionCreatePageProps) {
  return <PageSectionEditor pageId={params.id} />;
}
