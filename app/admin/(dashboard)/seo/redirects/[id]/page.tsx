import { RedirectEditor } from "@/features/redirects";

interface AdminRedirectEditPageProps {
  params: { id: string };
}

export default function AdminRedirectEditPage({ params }: AdminRedirectEditPageProps) {
  return <RedirectEditor id={params.id} />;
}
