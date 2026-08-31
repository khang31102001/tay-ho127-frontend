import { NavigationItemEditor } from "@/features/navigation";

interface AdminNavigationItemEditPageProps {
  params: { id: string; itemId: string };
}

export default function AdminNavigationItemEditPage({ params }: AdminNavigationItemEditPageProps) {
  return <NavigationItemEditor menuId={params.id} itemId={params.itemId} />;
}
