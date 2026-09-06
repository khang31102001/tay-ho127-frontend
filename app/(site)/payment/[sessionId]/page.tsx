import { PaymentPage } from "@/features/payment";

interface PaymentRouteProps {
  params: { sessionId: string };
}

// Payment Page dùng chung cho QR/DIGITAL_WALLET — Order thật chỉ được tạo sau
// khi khách xác nhận đã thanh toán, xem features/payment/services/payment-session.service.ts.
export default function PaymentRoute({ params }: PaymentRouteProps) {
  return <PaymentPage sessionId={params.sessionId} />;
}
