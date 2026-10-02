"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";

import { useSeoMetadataExplorer, type SeoMetadataRow } from "../hooks/useSeoMetadataExplorer";
import { seoMetadataRowId } from "../utils/seo-metadata-key";

const ENTITY_TYPE_LABEL: Record<SeoMetadataRow["entityType"], string> = {
  product: "Sản phẩm",
  category: "Danh mục",
  article: "Bài viết",
  page: "Trang nội dung",
  homepage: "Trang chủ",
};

const columns: DataExplorerColumn<SeoMetadataRow>[] = [
  { key: "label", header: "Entity" },
  {
    key: "entityType",
    header: "Loại",
    render: (row) => ENTITY_TYPE_LABEL[row.entityType],
  },
  {
    key: "url",
    header: "URL",
    render: (row) => (row.url ? row.url : <span className="text-brand-muted">Chưa có trang công khai</span>),
  },
  {
    key: "metaTitle",
    header: "Meta Title",
    render: (row) => row.metaTitle ?? <span className="text-brand-muted">(dùng mặc định)</span>,
  },
  {
    key: "robotsIndex",
    header: "Index",
    render: (row) =>
      row.robotsIndex ? (
        <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[12px] font-bold text-brand-greenDark">
          Index
        </span>
      ) : (
        <span className="rounded-full bg-brand-muted/10 px-2.5 py-1 text-[12px] font-bold text-brand-muted">
          Noindex
        </span>
      ),
  },
  {
    key: "updatedAt",
    header: "Cập nhật",
    render: (row) => (row.updatedAt ? new Date(row.updatedAt).toLocaleDateString("vi-VN") : "—"),
  },
];

export function SeoMetadataExplorer() {
  const { rows, isLoading, handleReset } = useSeoMetadataExplorer();

  return (
    <DataExplorer<SeoMetadataRow>
      title="SEO Metadata"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => seoMetadataRowId(row.entityType, row.entityId)}
      getSearchableText={(row) => `${row.label} ${row.url ?? ""} ${row.metaTitle ?? ""}`}
      searchPlaceholder="Tìm theo tên, URL, meta title..."
      editHref={(row) => `/admin/seo/metadata/${row.entityType}/${row.entityId ?? "_"}`}
      onDelete={handleReset}
      emptyState="Chưa có entity nào."
    />
  );
}
