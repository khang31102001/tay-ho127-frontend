import { notFound } from "next/navigation";

import { SeoEditor, type SeoEntityType } from "@/features/seo";

const VALID_ENTITY_TYPES: SeoEntityType[] = ["product", "category", "article", "page", "homepage"];

interface AdminSeoMetadataEditPageProps {
  params: { entityType: string; entityId: string };
}

/**
 * `entityId` = "_" là sentinel cho entityId = null (chỉ dùng cho
 * entityType="homepage" — xem hooks/useSeoMetadataExplorer.ts:seoMetadataRowId).
 */
export default function AdminSeoMetadataEditPage({ params }: AdminSeoMetadataEditPageProps) {
  if (!VALID_ENTITY_TYPES.includes(params.entityType as SeoEntityType)) {
    notFound();
  }

  const entityType = params.entityType as SeoEntityType;
  const entityId = params.entityId === "_" ? null : params.entityId;

  return <SeoEditor entityType={entityType} entityId={entityId} />;
}
