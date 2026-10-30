import type { EntityStatus } from "@/shared/admin/templates/StatusBadge";

/** Giới hạn từ của mô tả chi tiết — trùng với Product.MaxContentWords ở Backend. */
export const PRODUCT_CONTENT_MAX_WORDS = 1000;

export type ManagedProduct = {
  id: string;
  name: string;
  /** Đường dẫn công khai /thuc-don/{slug} — Backend tự sinh từ tên khi để trống, giữ nguyên khi đổi tên. */
  slug: string;
  categoryId: string;
  price: number;
  /** Mô tả ngắn (chữ thường) — hiện dưới tên món và trong danh sách. */
  description?: string;
  /**
   * Mô tả chi tiết (HTML từ RichTextEditor). Chỉ có khi mở 1 sản phẩm — danh sách
   * không trả trường này (undefined), và gửi undefined khi cập nhật = giữ nguyên.
   */
  content?: string;
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
