import { MediaEditor } from "@/features/media";

interface AdminMediaEditPageProps {
  params: { id: string };
}

export default function AdminMediaEditPage({ params }: AdminMediaEditPageProps) {
  return <MediaEditor id={params.id} />;
}
