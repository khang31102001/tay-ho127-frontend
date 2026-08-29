/**
 * 1 dòng sản phẩm trong Order — snapshot tại thời điểm đặt hàng, KHÔNG tham
 * chiếu sống tới Product (Catalog). Sửa giá/tên/ảnh Product sau này không
 * được làm thay đổi Order cũ.
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
};
