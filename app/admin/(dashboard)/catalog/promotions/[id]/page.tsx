import { PromotionEditor } from "@/features/orders/promotions";

interface AdminPromotionEditPageProps {
  params: { id: string };
}

export default function AdminPromotionEditPage({ params }: AdminPromotionEditPageProps) {
  return <PromotionEditor id={params.id} />;
}
