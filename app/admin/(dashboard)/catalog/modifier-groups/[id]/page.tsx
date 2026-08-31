import { ModifierGroupEditor } from "@/features/modifier-groups";

interface AdminModifierGroupEditPageProps {
  params: { id: string };
}

export default function AdminModifierGroupEditPage({ params }: AdminModifierGroupEditPageProps) {
  return <ModifierGroupEditor id={params.id} />;
}
