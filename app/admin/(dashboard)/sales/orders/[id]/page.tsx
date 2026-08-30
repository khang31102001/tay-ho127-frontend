import { OrderDetail } from "@/features/orders";

interface AdminOrderDetailPageProps {
  params: { id: string };
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  return <OrderDetail orderId={params.id} />;
}
