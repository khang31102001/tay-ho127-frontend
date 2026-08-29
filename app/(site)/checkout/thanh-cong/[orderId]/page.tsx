import { OrderConfirmation } from "@/features/checkout";

interface OrderConfirmationPageProps {
  params: { orderId: string };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  return <OrderConfirmation orderId={params.orderId} />;
}
