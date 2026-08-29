"use client";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";

import { useBannersExplorer } from "../hooks/useBannersExplorer";
import { BANNER_PLACEMENT_OPTIONS, type ManagedBanner } from "../types/banner.types";

const PLACEMENT_LABEL = Object.fromEntries(
  BANNER_PLACEMENT_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

function formatScheduleRange(banner: ManagedBanner): string {
  if (!banner.startAt && !banner.endAt) {
    return "Không giới hạn";
  }

  const from = banner.startAt ? new Date(banner.startAt).toLocaleDateString("vi-VN") : "…";
  const to = banner.endAt ? new Date(banner.endAt).toLocaleDateString("vi-VN") : "…";

  return `${from} → ${to}`;
}

const columns: DataExplorerColumn<ManagedBanner>[] = [
  { key: "name", header: "Tên banner" },
  {
    key: "placement",
    header: "Vị trí",
    render: (row) => PLACEMENT_LABEL[row.placement] ?? row.placement,
  },
  {
    key: "schedule",
    header: "Thời gian chạy",
    render: (row) => formatScheduleRange(row),
  },
  { key: "displayOrder", header: "Thứ tự" },
  {
    key: "isActive",
    header: "Trạng thái",
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold ${
          row.isActive
            ? "bg-brand-green/10 text-brand-greenDark"
            : "bg-brand-muted/10 text-brand-muted"
        }`}
      >
        {row.isActive ? "Đang bật" : "Đang tắt"}
      </span>
    ),
  },
];

export function BannersExplorer() {
  const { rows, isLoading, handleDelete } = useBannersExplorer();

  return (
    <DataExplorer<ManagedBanner>
      title="Quản lý Banner"
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.name} ${PLACEMENT_LABEL[row.placement] ?? ""}`}
      searchPlaceholder="Tìm banner..."
      createHref="/admin/content/banners/new"
      createLabel="Thêm banner"
      editHref={(row) => `/admin/content/banners/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có banner nào."
    />
  );
}
