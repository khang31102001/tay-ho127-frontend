import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

export type MediaType = "image" | "video" | "document";

export const MEDIA_TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "image", label: "Ảnh" },
  { value: "video", label: "Video" },
  { value: "document", label: "Tài liệu" },
];

export type ManagedMedia = {
  id: string;
  fileName: string;
  url: string;
  type: MediaType;
  altText?: string;
  /** Dung lượng (byte). */
  size: number;
  status: EntityStatus;
};
