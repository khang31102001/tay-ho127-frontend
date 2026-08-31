const FAVORITE_STORAGE_KEY = "tayho-favorites";

/**
 * Danh sách productId khách đã đánh dấu yêu thích — state thuần phía trình
 * duyệt (chưa có Backend), theo đúng pattern localStorage đang dùng cho Cart
 * (xem features/cart/services/cart.service.ts). Khi có Backend thật, chỉ cần
 * thay nội dung 2 hàm dưới đây (gọi API thay vì localStorage).
 */
export function readFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(FAVORITE_STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch (error) {
    console.error("Không thể đọc dữ liệu sản phẩm yêu thích:", error);
    localStorage.removeItem(FAVORITE_STORAGE_KEY);
    return [];
  }
}

export function writeFavoritesToStorage(productIds: string[]): void {
  try {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(productIds));
  } catch (error) {
    console.error("Không thể lưu dữ liệu sản phẩm yêu thích:", error);
  }
}
