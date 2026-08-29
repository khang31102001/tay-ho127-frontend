import { PageEditor } from "@/features/pages";

interface AdminPageEditPageProps {
  params: { id: string };
}

export default function AdminPageEditPage({ params }: AdminPageEditPageProps) {
  return <PageEditor id={params.id} />;
}
