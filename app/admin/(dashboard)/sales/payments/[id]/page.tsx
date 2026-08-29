import { PaymentDetail } from "@/features/payments";

interface AdminPaymentDetailPageProps {
  params: { id: string };
}

export default function AdminPaymentDetailPage({ params }: AdminPaymentDetailPageProps) {
  return <PaymentDetail paymentId={params.id} />;
}
