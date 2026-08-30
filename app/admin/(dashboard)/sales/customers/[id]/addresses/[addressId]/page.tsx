import { CustomerAddressEditor } from "@/features/customers";

interface AdminCustomerAddressEditPageProps {
  params: { id: string; addressId: string };
}

export default function AdminCustomerAddressEditPage({ params }: AdminCustomerAddressEditPageProps) {
  return <CustomerAddressEditor customerId={params.id} id={params.addressId} />;
}
