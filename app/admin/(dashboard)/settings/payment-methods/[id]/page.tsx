import { PaymentMethodEditor } from "@/features/payments/methods";

interface AdminPaymentMethodEditPageProps {
  params: { id: string };
}

export default function AdminPaymentMethodEditPage({ params }: AdminPaymentMethodEditPageProps) {
  return <PaymentMethodEditor id={params.id} />;
}
