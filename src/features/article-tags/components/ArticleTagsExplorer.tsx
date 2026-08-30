"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";

import { useArticleTagsExplorer } from "../hooks/useArticleTagsExplorer";
import type { ManagedArticleTag } from "../types/article-tag.types";

const columns: DataExplorerColumn<ManagedArticleTag>[] = [
  { key: "name", header: "Tên thẻ" },
  { key: "slug", header: "Slug" },
];

export function ArticleTagsExplorer() {
  const { rows, isLoading, handleDelete } = useArticleTagsExplorer();

  return (
    <DataExplorer<ManagedArticleTag>
      title="Thẻ bài viết"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.slug}`}
      searchPlaceholder="Tìm thẻ..."
      createHref="/admin/content/article-tags/new"
      createLabel="Thêm thẻ"
      editHref={(row) => `/admin/content/article-tags/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có thẻ nào."
    />
  );
}
