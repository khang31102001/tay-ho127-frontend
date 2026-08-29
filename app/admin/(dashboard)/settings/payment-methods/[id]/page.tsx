import { PaymentMethodEditor } from "@/features/payment-methods";

interface AdminPaymentMethodEditPageProps {
  params: { id: string };
}

export default function AdminPaymentMethodEditPage({ params }: AdminPaymentMethodEditPageProps) {
  return <PaymentMethodEditor id={params.id} />;
}
