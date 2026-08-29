import { PageSectionsExplorer } from "@/features/page-sections";

interface AdminPageSectionsPageProps {
  params: { id: string };
}

export default function AdminPageSectionsPage({ params }: AdminPageSectionsPageProps) {
  return <PageSectionsExplorer pageId={params.id} />;
}
