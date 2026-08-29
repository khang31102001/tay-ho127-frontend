import { BannerEditor } from "@/features/banners";

interface AdminBannerEditPageProps {
  params: { id: string };
}

export default function AdminBannerEditPage({ params }: AdminBannerEditPageProps) {
  return <BannerEditor id={params.id} />;
}
