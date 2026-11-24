"use client";

import { DataExplorer, type DataExplorerColumn } from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/shared/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";

import { getCategoryDeleteImpact } from "../services/category.service";

import { useCategoriesExplorer, type CategoryRow } from "../hooks/useCategoriesExplorer";

async function describeDeleteImpact(category: { id: string }) {
  const { childCount, productCount } = await getCategoryDeleteImpact(category.id);
  const effects = [
    childCount > 0 ? `${childCount} danh mục con sẽ được chuyển lên cấp trên` : null,
    productCount > 0 ? `${productCount} sản phẩm sẽ chuyển sang "Chưa phân loại"` : null,
  ].filter(Boolean);

  return effects.length > 0 ? `${effects.join("; ")}. Hành động này không thể hoàn tác.` : undefined;
}

const columns: DataExplorerColumn<CategoryRow>[] = [
  { key: "name", header: "Tên danh mục" },
  { key: "parentName", header: "Danh mục cha" },
  { key: "sortOrder", header: "Thứ tự", align: "right" },
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
      getDeleteDescription={describeDeleteImpact}
      loadError={loadError}
      emptyState="Chưa có danh mục nào."
    />
  );
}
