import { MenuProductEditor } from "@/features/catalog/menu-products";

interface AdminMenuProductEditPageProps {
  params: { id: string };
}

export default function AdminMenuProductEditPage({
  params,
}: AdminMenuProductEditPageProps) {
  return <MenuProductEditor id={params.id} />;
}
