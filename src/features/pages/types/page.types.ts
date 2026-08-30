import type { PublishStatus } from "@/components/shared/PublishStatusBadge";

/**
 * Page của User Site (Trang chủ, Thực đơn, Landing Page...) do Admin quản lý.
 * Nội dung chi tiết từng page nằm ở PageSection (xem features/page-sections),
 * Page chỉ giữ thông tin định danh + trạng thái xuất bản.
 */
export type ManagedPage = {
  id: string;
  name: string;
  slug: string;
  status: PublishStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
