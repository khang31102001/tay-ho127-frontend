"use client";

import Image from "next/image";
import { FileText, Video } from "lucide-react";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { useAdminAuth } from "@/features/admin-auth";
import { formatFileSize } from "@/lib/format-file-size";
import { isNextImageCompatibleUrl } from "@/lib/image-hosts";
import { MEDIA_TYPE_OPTIONS, type ManagedMedia } from "../types/media.types";

import { useMediaExplorer } from "../hooks/useMediaExplorer";

function mediaTypeLabel(type: ManagedMedia["type"]) {
  return MEDIA_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

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
    key: "size",
    header: "Dung lượng",
    render: (row) => formatFileSize(row.size),
  },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

export function MediaExplorer() {
  const { mediaItems, isLoading, loadError, handleDelete } = useMediaExplorer();
  const { hasPermission } = useAdminAuth();

  return (
    <DataExplorer<ManagedMedia>
      title="Thư viện Media"
      columns={columns}
      rows={mediaItems}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.fileName} ${row.altText ?? ""}`}
      searchPlaceholder="Tìm file..."
      createHref={hasPermission("media.create") ? "/admin/catalog/media/new" : undefined}
      createLabel="Thêm media"
      editHref={(row) => `/admin/catalog/media/${row.id}`}
      onDelete={hasPermission("media.delete") ? handleDelete : undefined}
      emptyState={loadError ?? "Chưa có file media nào."}
    />
  );
}
