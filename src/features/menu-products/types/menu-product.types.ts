/**
 * Liên kết Menu ↔ Product trong Catalog. Đặt tên ManagedMenuProduct để tránh
 * đụng với MenuItem (domain admin cũ, đã gỡ bỏ — xem CLAUDE.md phần lịch sử
 * gộp domain thực đơn).
 */
export type ManagedMenuProduct = {
  id: string;
  menuId: string;
  productId: string;
  /** Giá riêng cho sản phẩm trong thực đơn này; để trống = dùng giá gốc của Product. */
  priceOverride?: number;
  sortOrder: number;
  isAvailable: boolean;
};

/** Row đã join sẵn menuName/productName/effectivePrice, dùng cho Explorer. */
export type ManagedMenuProductRow = ManagedMenuProduct & {
  menuName: string;
  productName: string;
  effectivePrice: number;
};
