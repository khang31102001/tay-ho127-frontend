import type { PublishStatus } from "@/shared/components/PublishStatusBadge";

/**
 * Page của User Site (Trang chủ, Thực đơn, Landing Page...) do Admin quản lý.
 * Nội dung chi tiết từng page nằm ở PageSection (xem features/page-sections),
 * Page chỉ giữ thông tin định danh + trạng thái xuất bản.
 */
export type ManagedPage = {
  id: string;
  name: string;
  slug: string;
  /**
   * Mã cố định Site dùng để tìm trang ("home", "gioi-thieu"...) — không đổi theo môi trường như id tự sinh.
   * null = trang Site không tự đặt (vd. landing page chỉ vào bằng đường dẫn).
   */
  pageKey: string | null;
  /** Thứ tự trong danh sách Admin (tăng dần). */
  sortOrder: number;
  status: PublishStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
