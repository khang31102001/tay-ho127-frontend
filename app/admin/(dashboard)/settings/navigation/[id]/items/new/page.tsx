import { NavigationItemEditor } from "@/features/navigation";

interface AdminNavigationItemNewPageProps {
  params: { id: string };
}

export default function AdminNavigationItemNewPage({ params }: AdminNavigationItemNewPageProps) {
  return <NavigationItemEditor menuId={params.id} />;
}
