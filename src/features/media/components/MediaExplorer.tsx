"use client";

import Image from "next/image";
import { useState } from "react";
import { FileText, Trash2, Video } from "lucide-react";

import {
  DataExplorer,
  DataExplorerFilterSelect,
  type DataExplorerColumn,
} from "@/shared/admin/templates/DataExplorer/DataExplorer";
import { adminButtonClassName } from "@/shared/admin/templates/formFieldClassName";
import { StatusBadge } from "@/shared/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import { formatFileSize } from "@/core/utils/format-file-size";
import { isNextImageCompatibleUrl } from "@/core/config/image-hosts";
import { MEDIA_CATEGORIES, getMediaCategoryLabel } from "../types/media-category.types";
import { MEDIA_STORAGE_LABELS, MEDIA_TYPE_OPTIONS, type ManagedMedia } from "../types/media.types";

import { useMediaExplorer } from "../hooks/useMediaExplorer";
import type { LibraryMediaStatusFilter } from "../services/media-library.service";
import { MediaPurgeDialog } from "./MediaPurgeDialog";

const STATUS_FILTER_OPTIONS: { value: LibraryMediaStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
];

function mediaTypeLabel(type: ManagedMedia["type"]) {
  return MEDIA_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

const CATEGORY_FILTER_OPTIONS = [
  { value: "all" as const, label: "Tất cả nhóm" },
  ...MEDIA_CATEGORIES.map((category) => ({ value: category.code, label: category.label })),
];

const columns: DataExplorerColumn<ManagedMedia>[] = [
  {
    key: "preview",
    header: "",
    className: "w-[56px]",
    render: (row) =>
      row.type === "image" ? (
        <Image
          src={row.url}
          alt={row.altText ?? row.fileName}
          width={40}
          height={40}
          // Host chưa khai báo: bỏ tối ưu để xem trước không lỗi (media này không dùng được ở Site).
          unoptimized={!isNextImageCompatibleUrl(row.url)}
          title={isNextImageCompatibleUrl(row.url) ? undefined : "Host ảnh chưa khai báo trong NEXT_PUBLIC_IMAGE_REMOTE_HOSTS — chưa chọn được cho nội dung Site."}
          className="size-10 rounded-md object-cover"
        />
      ) : (
        <span className="flex size-10 items-center justify-center rounded-md bg-brand-cream text-brand-muted">
          {row.type === "video" ? <Video className="size-5" /> : <FileText className="size-5" />}
        </span>
      ),
  },
  { key: "fileName", header: "Tên file" },
  {
    key: "type",
    header: "Loại",
    render: (row) => mediaTypeLabel(row.type),
  },
  {
    key: "category",
    header: "Nhóm",
    render: (row) => (row.categoryCode ? getMediaCategoryLabel(row.categoryCode) : "—"),
  },
  {
    key: "storage",
    header: "Nơi lưu",
    render: (row) => (row.storage ? MEDIA_STORAGE_LABELS[row.storage] : "—"),
  },
  {
    key: "size",
    header: "Dung lượng",
    align: "right",
    render: (row) => formatFileSize(row.size),
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function MediaExplorer() {
  const { loadPage, handleDelete, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, reload } = useMediaExplorer();
  const { hasPermission } = useAdminAuth();
  const [purgeTargets, setPurgeTargets] = useState<{ media: ManagedMedia[]; clearSelection: () => void } | null>(null);
  const canPurge = hasPermission("media.purge");

  return (
    <>
    <DataExplorer<ManagedMedia>
      title="Thư viện Media"
      columns={columns}
      loadPage={loadPage}
      getRowId={(row) => row.id}
      searchPlaceholder="Tìm theo tên file..."
      createHref={hasPermission("media.create") ? "/admin/catalog/media/new" : undefined}
      createLabel="Thêm media"
      editHref={(row) => `/admin/catalog/media/${row.id}`}
      onDelete={hasPermission("media.delete") ? handleDelete : undefined}
      emptyState="Chưa có file media nào."
      totalLabel="file"
      filters={
        <>
          <DataExplorerFilterSelect
            ariaLabel="Lọc theo nhóm kho ảnh"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={CATEGORY_FILTER_OPTIONS}
          />
          <DataExplorerFilterSelect
            ariaLabel="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
          />
        </>
      }
      bulkActions={
        canPurge
          ? (selectedRows, clearSelection) => (
              <button
                type="button"
                onClick={() => setPurgeTargets({ media: selectedRows, clearSelection })}
                className={adminButtonClassName.danger}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Xóa vĩnh viễn ({selectedRows.length})
              </button>
            )
          : undefined
      }
    />

    {purgeTargets && (
      <MediaPurgeDialog
        media={purgeTargets.media}
        onClose={() => setPurgeTargets(null)}
        onFinished={() => {
          purgeTargets.clearSelection();
          reload();
        }}
      />
    )}
    </>
  );
}
