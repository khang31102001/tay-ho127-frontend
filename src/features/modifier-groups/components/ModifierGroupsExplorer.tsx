"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";

import { useModifierGroupsExplorer } from "../hooks/useModifierGroupsExplorer";
import { MODIFIER_SELECTION_TYPE_OPTIONS, type ManagedModifierGroup } from "../types/modifier-group.types";

const SELECTION_TYPE_LABEL = Object.fromEntries(
  MODIFIER_SELECTION_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const columns: DataExplorerColumn<ManagedModifierGroup>[] = [
  { key: "name", header: "Tên nhóm" },
  {
    key: "selectionType",
    header: "Kiểu chọn",
    render: (row) => SELECTION_TYPE_LABEL[row.selectionType] ?? row.selectionType,
  },
  {
    key: "options",
    header: "Số lựa chọn",
    render: (row) => row.options.length,
  },
  {
    key: "isRequired",
    header: "Bắt buộc",
    render: (row) => (row.isRequired ? "✓" : "—"),
  },
];

export function ModifierGroupsExplorer() {
  const { rows, isLoading, handleDelete } = useModifierGroupsExplorer();

  return (
    <DataExplorer<ManagedModifierGroup>
      title="Nhóm tùy chọn món (Modifier)"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.options.map((option) => option.label).join(" ")}`}
      searchPlaceholder="Tìm theo tên nhóm, tên lựa chọn..."
      createHref="/admin/catalog/modifier-groups/new"
      createLabel="Thêm nhóm"
      editHref={(row) => `/admin/catalog/modifier-groups/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có nhóm tùy chọn món nào."
    />
  );
}
