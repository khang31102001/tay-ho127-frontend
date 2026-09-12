import { OrderOptionEditor } from "@/features/order-options";

interface AdminOrderOptionEditPageProps {
  params: { id: string };
}

export default function AdminOrderOptionEditPage({ params }: AdminOrderOptionEditPageProps) {
  return <OrderOptionEditor id={params.id} />;
}
