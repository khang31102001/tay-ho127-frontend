import { RoleEditor } from "@/features/roles";

interface AdminRoleEditPageProps {
  params: { id: string };
}

export default function AdminRoleEditPage({ params }: AdminRoleEditPageProps) {
  return <RoleEditor id={params.id} />;
}
