import { PageSectionEditor } from "@/features/page-sections";

interface AdminPageSectionEditPageProps {
  params: { id: string; sectionId: string };
}

export default function AdminPageSectionEditPage({ params }: AdminPageSectionEditPageProps) {
  return <PageSectionEditor pageId={params.id} id={params.sectionId} />;
}
