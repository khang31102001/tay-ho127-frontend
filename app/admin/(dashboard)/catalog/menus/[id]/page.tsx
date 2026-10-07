import { MenuEditor } from "@/features/menus";
import { MenuProductsPicker } from "@/features/menu-products";

interface AdminCatalogMenuEditPageProps {
  params: { id: string };
}

export default function AdminCatalogMenuEditPage({ params }: AdminCatalogMenuEditPageProps) {
  return (
    <>
      <MenuEditor id={params.id} />
      <MenuProductsPicker menuId={params.id} />
    </>
  );
}
