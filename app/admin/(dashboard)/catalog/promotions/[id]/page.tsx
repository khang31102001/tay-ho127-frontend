import { PromotionEditor } from "@/features/promotions";

interface AdminPromotionEditPageProps {
  params: { id: string };
}

export default function AdminPromotionEditPage({ params }: AdminPromotionEditPageProps) {
  return <PromotionEditor id={params.id} />;
}
