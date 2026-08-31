import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

export type ManagedProduct = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  status: EntityStatus;
  /** Tham chiếu ManagedMedia.id, chọn từ Media Library. */
  mediaIds: string[];
  /** Tham chiếu ManagedModifierGroup.id (features/modifier-groups), chọn nhóm tùy chọn áp dụng cho món này — mảng rỗng = không có modifier. */
  modifierGroupIds: string[];
  /** Đánh giá trung bình hiển thị trên site (thang 5 sao). Không có UI admin để sửa — sửa qua seed. */
  rating?: number;
  /** Số lượt đánh giá đi kèm `rating`. */
  ratingCount?: number;
  /** Giá gốc trước giảm giá, hiển thị gạch ngang cạnh `price` trên site. */
  oldPrice?: number;
  /** Nhãn dùng để khớp tìm kiếm trên site (không hiển thị UI). */
  badge?: string;
};
