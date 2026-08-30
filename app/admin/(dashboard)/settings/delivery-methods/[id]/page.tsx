import { DeliveryMethodEditor } from "@/features/delivery-methods";

interface AdminDeliveryMethodEditPageProps {
  params: { id: string };
}

export default function AdminDeliveryMethodEditPage({ params }: AdminDeliveryMethodEditPageProps) {
  return <DeliveryMethodEditor id={params.id} />;
}
