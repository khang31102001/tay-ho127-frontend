import { UserEditor } from "@/features/users";

interface AdminUserEditPageProps {
  params: { id: string };
}

export default function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  return <UserEditor id={params.id} />;
}
