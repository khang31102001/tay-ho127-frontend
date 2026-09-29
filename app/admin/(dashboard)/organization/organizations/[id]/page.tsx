import { OrganizationEditor } from "@/features/organization";

interface AdminOrganizationEditPageProps {
  params: { id: string };
}

export default function AdminOrganizationEditPage({ params }: AdminOrganizationEditPageProps) {
  return <OrganizationEditor id={params.id} />;
}
