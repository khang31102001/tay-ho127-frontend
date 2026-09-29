import { PermissionEditor } from "@/features/permissions";

interface AdminPermissionEditPageProps {
  params: { id: string };
}

export default function AdminPermissionEditPage({ params }: AdminPermissionEditPageProps) {
  return <PermissionEditor id={params.id} />;
}
