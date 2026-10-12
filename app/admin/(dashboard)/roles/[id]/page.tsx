import { RoleEditor } from "@/features/access-control/roles";

interface AdminRoleEditPageProps {
  params: { id: string };
}

export default function AdminRoleEditPage({ params }: AdminRoleEditPageProps) {
  return <RoleEditor id={params.id} />;
}
