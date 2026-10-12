import { CustomerEditor } from "@/features/access-control/customers";

interface AdminCustomerEditPageProps {
  params: { id: string };
}

export default function AdminCustomerEditPage({ params }: AdminCustomerEditPageProps) {
  return <CustomerEditor id={params.id} />;
}
