/**
 * Màu badge danh mục dùng chung cho ProductCard và trang chi tiết sản phẩm,
 * theo đúng màu dùng cho từng loại món trên toàn site (đỏ = món mặn, xanh = món chay).
 * Đặt ở module không phải "use client" để Server Component (ProductDetail) dùng
 * được trực tiếp — import từ ProductCard.tsx ("use client") sẽ lỗi vì Server
 * Component không thể đọc thuộc tính của một client module export.
 */
export const CATEGORY_BADGE_CLASS: Record<string, string> = {
  "Món mặn": "bg-brand-red",
  "Món chay": "bg-brand-green",
  "Ăn kèm": "bg-brand-wood",
};
