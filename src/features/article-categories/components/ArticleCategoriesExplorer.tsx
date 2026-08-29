"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";

import { useArticleCategoriesExplorer, type ArticleCategoryRow } from "../hooks/useArticleCategoriesExplorer";

const columns: DataExplorerColumn<ArticleCategoryRow>[] = [
  { key: "name", header: "Tên danh mục" },
  { key: "slug", header: "Slug" },
  { key: "parentName", header: "Danh mục cha" },
  { key: "sortOrder", header: "Thứ tự" },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function ArticleCategoriesExplorer() {
  const { rows, isLoading, handleDelete } = useArticleCategoriesExplorer();

  return (
    <DataExplorer<ArticleCategoryRow>
      title="Danh mục bài viết"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.slug} ${row.parentName}`}
      searchPlaceholder="Tìm danh mục..."
      createHref="/admin/content/article-categories/new"
      createLabel="Thêm danh mục"
      editHref={(row) => `/admin/content/article-categories/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có danh mục bài viết nào."
    />
  );
}
