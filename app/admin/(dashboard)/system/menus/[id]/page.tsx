import { AdminMenuEditor } from "@/features/admin-menus";

interface AdminSystemMenuEditPageProps {
  params: { id: string };
}

export default function AdminSystemMenuEditPage({ params }: AdminSystemMenuEditPageProps) {
  return <AdminMenuEditor id={params.id} />;
}
