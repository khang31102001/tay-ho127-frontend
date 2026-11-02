import { PageSectionEditor } from "@/features/content/page-sections";

interface AdminPageSectionCreatePageProps {
  params: { id: string };
  searchParams: { slot?: string };
}

export default function AdminPageSectionCreatePage({ params, searchParams }: AdminPageSectionCreatePageProps) {
  return <PageSectionEditor pageId={params.id} initialSlotKey={searchParams.slot} />;
}
