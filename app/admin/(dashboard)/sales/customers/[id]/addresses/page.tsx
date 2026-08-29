import { CustomerAddressesExplorer } from "@/features/customers";

interface AdminCustomerAddressesPageProps {
  params: { id: string };
}

export default function AdminCustomerAddressesPage({ params }: AdminCustomerAddressesPageProps) {
  return <CustomerAddressesExplorer customerId={params.id} />;
}
