"use client";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";

import type { SeoEntityType } from "../types/seo-metadata.types";
import { useSeoEditorPage } from "../hooks/useSeoEditorPage";
import { SeoFieldsForm } from "./SeoFieldsForm";

type SeoEditorProps = {
  entityType: SeoEntityType;
  entityId: string | null;
};

const ENTITY_TYPE_LABEL: Record<SeoEntityType, string> = {
  product: "Sản phẩm",
  category: "Danh mục",
  article: "Bài viết",
  page: "Trang nội dung",
  homepage: "Trang chủ",
};

/**
 * Màn hình Sửa SEO đứng riêng (Admin > SEO > Metadata > Sửa) — dùng khi vào
 * từ SEO Metadata List, KHÔNG dùng khi sửa qua tab "SEO" trong Product/
 * Category/Article Editor (những nơi đó dùng thẳng SeoFieldsForm + hook
 * useSeoMetadataForm, xem ProductEditor.tsx).
 */
export function SeoEditor({ entityType, entityId }: SeoEditorProps) {
  const { entry, settings, mediaOptions, isLoading, form, updateField, hasOverride, save, reset, goToExplore } =
    useSeoEditorPage({ entityType, entityId });

  return (
    <DataEditor
      title={`SEO — ${ENTITY_TYPE_LABEL[entityType]}${entry ? `: ${entry.label}` : ""}`}
      backHref="/admin/seo/metadata"
      isLoading={isLoading || !entry || !settings}
      onSave={async () => {
        await save();
      }}
      onSaved={goToExplore}
      onDelete={hasOverride ? reset : undefined}
      onDeleted={goToExplore}
      deleteConfirmTitle="Xoá override SEO?"
      deleteConfirmDescription="Entity sẽ quay lại dùng dữ liệu mặc định (tên/mô tả/ảnh của entity + SEO Settings chung)."
    >
      {entry && settings && (
        <SeoFieldsForm
          form={form}
          updateField={updateField}
          mediaOptions={mediaOptions}
          entityDefaults={entry.defaults}
          settings={settings}
          previewUrl={entry.url}
        />
      )}
    </DataEditor>
  );
}
