import { NavigationItemEditor } from "@/features/navigation";

interface AdminSystemMenuEditPageProps {
  params: { id: string };
}

export default function AdminSystemMenuEditPage({ params }: AdminSystemMenuEditPageProps) {
  return <NavigationItemEditor scope="admin" itemId={params.id} />;
}
