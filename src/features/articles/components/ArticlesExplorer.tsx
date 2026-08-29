"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { PublishStatusBadge } from "@/components/shared/PublishStatusBadge";

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
  const { rows, statusFilter, setStatusFilter, isLoading, handleDelete } = useArticlesExplorer();

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
      emptyState="Chưa có bài viết nào."
      toolbarActions={
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ArticleStatusFilter)}
          className="h-10 rounded-lg border border-brand-line px-3 text-[13px] font-bold text-brand-greenDark outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    />
  );
}
