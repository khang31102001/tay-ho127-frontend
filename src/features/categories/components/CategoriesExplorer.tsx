"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import { useCategoriesExplorer, type CategoryRow } from "../hooks/useCategoriesExplorer";

const columns: DataExplorerColumn<CategoryRow>[] = [
  { key: "name", header: "Tên danh mục" },
  { key: "parentName", header: "Danh mục cha" },
  { key: "sortOrder", header: "Thứ tự" },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function CategoriesExplorer() {
  const { rows, isLoading, loadError, handleDelete } = useCategoriesExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<CategoryRow>
      title="Quản lý danh mục"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.parentName}`}
      searchPlaceholder="Tìm danh mục..."
      createHref={hasPermission("categories.create") ? "/admin/catalog/categories/new" : undefined}
      createLabel="Thêm danh mục"
      editHref={(row) => `/admin/catalog/categories/${row.id}`}
      onDelete={hasPermission("categories.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có danh mục nào."}
    />
  );
}
