import { CustomerAddressesExplorer } from "@/features/access-control/customers";

interface AdminCustomerAddressesPageProps {
  params: { id: string };
}

export default function AdminCustomerAddressesPage({ params }: AdminCustomerAddressesPageProps) {
  return <CustomerAddressesExplorer customerId={params.id} />;
}
