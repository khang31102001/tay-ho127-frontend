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
  /**
   * Giá GỐC sản phẩm — CHƯA cộng priceAdjustment của modifier. Nguồn duy nhất
   * để tính unitPrice (xem calculateCartItemUnitPrice trong cart.service.ts).
   */
  basePrice: number;
  image: string;
  modifiers?: CartItemModifierSelection[];
  /**
   * Ghi chú RIÊNG cho món này (vd. "Không hành") — khác hẳn `note` toàn đơn ở
   * CartContextType bên dưới (áp dụng cho cả đơn, chọn tại Cart Page). Không
   * tham gia vào cartItemId/buildCartItemId — sửa specialInstructions không
   * tách thành dòng giỏ hàng mới, chỉ modifier khác nhau mới tách dòng.
   */
  specialInstructions?: string;
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

/** RadioOption yêu cầu type string — chuyển sang boolean khi submit (xem features/checkout/hooks/useCheckoutForm.ts). */
export type UtensilsPreference = "yes" | "no";

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPrice: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  /**
   * Order-level preferences (Delivery Method + Order Preferences) — chọn tại
   * Cart Page (CartPageSection), giữ nguyên qua Checkout để tạo Order. Tách
   * khỏi CartItem/Product vì áp dụng cho TOÀN đơn, không lưu chung với từng
   * món. `deliveryMethodId` trỏ tới ManagedDeliveryMethod.id (features/delivery-methods).
   */
  deliveryMethodId: string;
  setDeliveryMethodId: (methodId: string) => void;
  address: string;
  setAddress: (address: string) => void;
  utensils: UtensilsPreference;
  setUtensils: (value: UtensilsPreference) => void;
  note: string;
  setNote: (note: string) => void;

  /**
   * General Order Options ĐÃ CHỌN (vd. Nước mắm/Rau) — áp dụng cho TOÀN đơn,
   * không gắn với Product/CartItem nào (xem features/order-options — domain
   * sở hữu danh sách option; Cart chỉ lưu lựa chọn của khách). Nguồn DUY NHẤT
   * cho cả Mini Cart lẫn Cart Page/Checkout — component nào cũng đọc/ghi
   * thẳng field này nên luôn đồng bộ ngay lập tức, không qua state cục bộ
   * riêng ở từng nơi hiển thị.
   */
  orderOptionSelections: CartItemModifierSelection[];
  setOrderOptionSelections: (selections: CartItemModifierSelection[]) => void;
}
