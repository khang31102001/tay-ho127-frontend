import { NavigationTree } from "@/features/navigation";

interface AdminNavigationItemsPageProps {
  params: { id: string };
}

export default function AdminNavigationItemsPage({ params }: AdminNavigationItemsPageProps) {
  return <NavigationTree menuId={params.id} />;
}
