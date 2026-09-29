import { DepartmentEditor } from "@/features/organization";

interface AdminDepartmentEditPageProps {
  params: { id: string };
}

export default function AdminDepartmentEditPage({ params }: AdminDepartmentEditPageProps) {
  return <DepartmentEditor id={params.id} />;
}
