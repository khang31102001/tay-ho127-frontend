import { CustomerAddressEditor } from "@/features/access-control/customers";

interface AdminCustomerAddressCreatePageProps {
  params: { id: string };
}

export default function AdminCustomerAddressCreatePage({ params }: AdminCustomerAddressCreatePageProps) {
  return <CustomerAddressEditor customerId={params.id} />;
}
