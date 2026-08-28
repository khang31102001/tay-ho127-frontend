"use client";

import Image from "next/image";
import { FileText, Video } from "lucide-react";

import { DataExplorer, type DataExplorerColumn } from "@/components/admin/templates/DataExplorer/DataExplorer";
import { StatusBadge } from "@/components/admin/templates/StatusBadge";
import { formatFileSize } from "@/lib/format-file-size";
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
  const { mediaItems, isLoading, handleDelete } = useMediaExplorer();

  return (
    <DataExplorer<ManagedMedia>
      title="Thư viện Media"
      columns={columns}
      rows={mediaItems}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      getSearchableText={(row) => `${row.fileName} ${row.altText ?? ""}`}
      searchPlaceholder="Tìm file..."
      createHref="/admin/catalog/media/new"
      createLabel="Thêm media"
      editHref={(row) => `/admin/catalog/media/${row.id}`}
      onDelete={handleDelete}
      emptyState="Chưa có file media nào."
    />
  );
}
