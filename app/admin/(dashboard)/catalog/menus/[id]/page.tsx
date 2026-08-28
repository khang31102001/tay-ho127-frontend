import { MenuEditor } from "@/features/menus";

interface AdminCatalogMenuEditPageProps {
  params: { id: string };
}

export default function AdminCatalogMenuEditPage({ params }: AdminCatalogMenuEditPageProps) {
  return <MenuEditor id={params.id} />;
}
