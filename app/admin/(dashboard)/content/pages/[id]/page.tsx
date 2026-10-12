import { PageEditor } from "@/features/content/pages";

interface AdminPageEditPageProps {
  params: { id: string };
}

export default function AdminPageEditPage({ params }: AdminPageEditPageProps) {
  return <PageEditor id={params.id} />;
}
