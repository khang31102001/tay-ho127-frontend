import { MenuEditor } from "@/features/catalog/menus";
import { MenuProductsPicker } from "@/features/catalog/menu-products";

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
