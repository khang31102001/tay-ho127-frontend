import { SystemSettingEditor } from "@/features/platform";

interface AdminSystemSettingEditPageProps {
  params: { id: string };
}

export default function AdminSystemSettingEditPage({ params }: AdminSystemSettingEditPageProps) {
  return <SystemSettingEditor id={params.id} />;
}
