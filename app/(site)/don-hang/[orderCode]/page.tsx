import { OrderTrackingPage } from "@/features/orders/components/OrderTrackingPage";

interface OrderTrackingRouteProps {
  params: { orderCode: string };
}

// Order Success + Order Tracking gộp 1 trang, tra theo orderCode (mã công khai).
export default function OrderTrackingRoute({ params }: OrderTrackingRouteProps) {
  return <OrderTrackingPage orderCode={params.orderCode} />;
}
