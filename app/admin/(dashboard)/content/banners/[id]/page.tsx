import { BannerEditor } from "@/features/content/banners";

interface AdminBannerEditPageProps {
  params: { id: string };
}

export default function AdminBannerEditPage({ params }: AdminBannerEditPageProps) {
  return <BannerEditor id={params.id} />;
}
