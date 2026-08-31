import { NavigationMenuEditor } from "@/features/navigation";

interface AdminNavigationEditPageProps {
  params: { id: string };
}

export default function AdminNavigationEditPage({ params }: AdminNavigationEditPageProps) {
  return <NavigationMenuEditor id={params.id} />;
}
