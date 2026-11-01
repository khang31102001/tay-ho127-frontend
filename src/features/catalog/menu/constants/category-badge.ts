import { normalizeText } from "@/core/utils/normalize-text";

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
  "Đồ uống": "bg-brand-ink",
};

/** Từ khóa (đã bỏ dấu) trong tên danh mục cấp giữa để xếp món vào nhóm "Ăn kèm". */
const SIDE_DISH_KEYWORDS = ["an kem", "them", "banh ngot", "gia vi", "phu thu", "dong goi"];

/**
 * Quy tên danh mục cấp giữa (vd. "Bánh cuốn", "Món chay", "Món thêm", "Đồ uống")
 * về nhóm món hiển thị trên site. Dùng chung cho menu.service (Server) và
 * useMenuGrid (Client) để hai nơi không lệch nhau. Không khớp nhóm nào thì là "Món mặn".
 */
export function resolveMenuCategoryBucket(categoryName: string): string {
  const normalized = normalizeText(categoryName);

  if (normalized.includes("chay")) {
    return "Món chay";
  }

  if (normalized.includes("uong")) {
    return "Đồ uống";
  }

  if (SIDE_DISH_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "Ăn kèm";
  }

  return "Món mặn";
}
