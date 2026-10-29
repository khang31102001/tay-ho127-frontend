"use client";

import {
  DataExplorer,
  DataExplorerFilterSelect,
  type DataExplorerColumn,
} from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { PublishStatusBadge } from "@/shared/components/PublishStatusBadge";

import { useArticlesExplorer, type ArticleRow, type ArticleStatusFilter } from "../hooks/useArticlesExplorer";

const STATUS_FILTER_OPTIONS: { value: ArticleStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived", label: "Đã lưu trữ" },
];

const columns: DataExplorerColumn<ArticleRow>[] = [
  { key: "title", header: "Tiêu đề" },
  { key: "categoryName", header: "Danh mục" },
  { key: "authorName", header: "Tác giả" },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <PublishStatusBadge status={row.status} />,
  },
];

export function ArticlesExplorer() {
  const { rows, statusFilter, setStatusFilter, isLoading, loadError, handleDelete } = useArticlesExplorer();

  return (
    <DataExplorer<ArticleRow>
      title="Quản lý bài viết"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.title} ${row.categoryName} ${row.authorName}`}
      searchPlaceholder="Tìm bài viết..."
      createHref="/admin/content/articles/new"
      createLabel="Thêm bài viết"
      editHref={(row) => `/admin/content/articles/${row.id}`}
      onDelete={handleDelete}
      loadError={loadError}
      emptyState="Chưa có bài viết nào."
      totalLabel="bài viết"
      filters={
        <DataExplorerFilterSelect
          ariaLabel="Lọc theo trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
        />
      }
    />
  );
}
