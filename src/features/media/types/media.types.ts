import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

export const MEDIA_TYPE_OPTIONS = [
  { value: "image", label: "Hình ảnh" },
  { value: "video", label: "Video" },
  { value: "document", label: "Tài liệu" },
] as const;

export type MediaType = (typeof MEDIA_TYPE_OPTIONS)[number]["value"];

export type ManagedMedia = {
  id: string;
  fileName: string;
  url: string;
  type: MediaType;
  altText?: string;
  /** Dung lượng file, đơn vị byte. */
  size: number;
  status: EntityStatus;
};
