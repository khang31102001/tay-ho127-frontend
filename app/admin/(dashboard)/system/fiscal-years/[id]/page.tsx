import { FiscalYearEditor } from "@/features/platform";

interface AdminFiscalYearEditPageProps {
  params: { id: string };
}

export default function AdminFiscalYearEditPage({ params }: AdminFiscalYearEditPageProps) {
  return <FiscalYearEditor id={params.id} />;
}
