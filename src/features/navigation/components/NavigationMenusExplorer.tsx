"use client";

import Link from "next/link";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";

import { useNavigationMenusExplorer } from "../hooks/useNavigationMenusExplorer";
import { NAVIGATION_LOCATION_OPTIONS, type ManagedNavigationMenu } from "../types/navigation.types";

const LOCATION_LABEL = Object.fromEntries(
  NAVIGATION_LOCATION_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const columns: DataExplorerColumn<ManagedNavigationMenu>[] = [
  { key: "name", header: "Tên menu" },
  { key: "code", header: "Code" },
  {
    key: "location",
    header: "Vị trí",
    render: (row) => LOCATION_LABEL[row.location] ?? row.location,
  },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) => (
      <StatusBadge status={row.isActive ? "active" : "inactive"} activeLabel="Đang bật" inactiveLabel="Đang tắt" />
    ),
  },
  {
    key: "items",
    header: "Cấu trúc menu",
    render: (row) => (
      <Link
        href={`/admin/settings/navigation/${row.id}/items`}
        className="text-[13px] font-bold text-brand-greenDark hover:underline"
      >
        Quản lý mục →
      </Link>
    ),
  },
];

export function NavigationMenusExplorer() {
  const { rows, isLoading, handleDelete } = useNavigationMenusExplorer();

  return (
    <DataExplorer<ManagedNavigationMenu>
      title="Navigation"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${row.code}`}
      searchPlaceholder="Tìm theo tên, code..."
      createHref="/admin/settings/navigation/new"
      createLabel="Thêm menu"
      editHref={(row) => `/admin/settings/navigation/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có menu nào."
    />
  );
}
