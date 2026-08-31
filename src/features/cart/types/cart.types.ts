/**
 * 1 lựa chọn Modifier khách đã chọn cho 1 CartItem — mang sẵn groupName/
 * optionLabel/priceAdjustment để hiển thị ngay (Cart Page/Checkout) không cần
 * gọi lại API. Khi Đặt hàng, service chỉ nhận lại {groupId, optionId} và tự
 * tra cứu lại label/giá thật (xem features/orders — không tin dữ liệu hiển
 * thị do Frontend gửi lên, đúng nguyên tắc #26).
 */
export interface CartItemModifierSelection {
  groupId: string;
  groupName: string;
  optionId: string;
  optionLabel: string;
  priceAdjustment: number;
}

export interface CartProduct {
  /** ManagedProduct.id thật (Catalog) — dùng để tra cứu lại giá/tồn kho khi tạo Order. */
  productId: string;
  name: string;
  /** Đơn giá đã cộng dồn priceAdjustment của các modifier đã chọn (chỉ để hiển thị/tính tạm — giá thật do Order tính lại). */
  price: number;
  image: string;
  modifiers?: CartItemModifierSelection[];
}

export interface CartItem extends CartProduct {
  /**
   * Định danh DUY NHẤT của dòng hàng trong giỏ — KHÁC `productId` khi có
   * modifiers, vì 2 dòng cùng sản phẩm nhưng khác lựa chọn (vd. "Cay" và
   * "Không cay") phải tách riêng, không gộp số lượng. Không có modifier thì
   * `id === productId` (giữ đúng hành vi gộp cũ). Mọi thao tác tăng/giảm/xóa
   * trong giỏ dùng field này.
   */
  id: string;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPrice: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}
