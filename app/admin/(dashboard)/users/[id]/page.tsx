import { UserEditor } from "@/features/access-control/users";

interface AdminUserEditPageProps {
  params: { id: string };
}

export default function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  return <UserEditor id={params.id} />;
}
