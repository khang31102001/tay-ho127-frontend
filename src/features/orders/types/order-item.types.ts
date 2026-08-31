/**
 * 1 lựa chọn Modifier đã áp dụng cho dòng hàng — snapshot tại thời điểm đặt
 * hàng (label/giá tại thời điểm đó), KHÔNG tham chiếu sống tới ManagedModifierGroup/
 * ModifierOption. Admin đổi tên/giá modifier sau này không làm thay đổi Order cũ.
 */
export type OrderItemModifierSnapshot = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionLabel: string;
  priceAdjustment: number;
};

/**
 * 1 dòng sản phẩm trong Order — snapshot tại thời điểm đặt hàng, KHÔNG tham
 * chiếu sống tới Product (Catalog). Sửa giá/tên/ảnh Product sau này không
 * được làm thay đổi Order cũ. `unitPrice` là giá GỐC sản phẩm (chưa cộng
 * modifier) — `lineTotal` mới là số đã cộng dồn priceAdjustment của `modifiers`.
 */
export type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  discount?: number;
  lineTotal: number;
  note?: string;
  modifiers?: OrderItemModifierSnapshot[];
};
