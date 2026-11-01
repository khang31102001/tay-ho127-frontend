import type { EntityStatus } from "@/shared/admin/templates/StatusBadge";

export type MediaType = "image" | "video" | "document";

export const MEDIA_TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "image", label: "Ảnh" },
  { value: "video", label: "Video" },
  { value: "document", label: "Tài liệu" },
];

/** Nơi chứa file — khớp MediaStorageProvider của Backend (viết thường). */
export type MediaStorage = "local" | "s3" | "cloudinary" | "external";

/** Nơi lưu chọn được khi upload file; "external" chỉ là URL nhập tay, không upload. */
export type MediaUploadStorage = Exclude<MediaStorage, "external">;

export const MEDIA_STORAGE_LABELS: Record<MediaStorage, string> = {
  local: "Server",
  s3: "Cloud (Vietnix)",
  cloudinary: "Cloud (Cloudinary)",
  external: "Liên kết ngoài",
};

/** GET /media/storage-options — server cho biết nơi nào đã cấu hình và nơi nào là mặc định. */
export type MediaStorageOption = {
  code: MediaUploadStorage;
  isAvailable: boolean;
  isDefault: boolean;
};

export type ManagedMedia = {
  id: string;
  fileName: string;
  url: string;
  type: MediaType;
  altText?: string;
  /** Dung lượng (byte). */
  size: number;
  status: EntityStatus;
  /** Chỉ có ở danh sách Admin; media đọc từ API public/mock không mang trường này. */
  storage?: MediaStorage;
};
