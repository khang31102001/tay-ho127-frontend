export const DELIVERY_METHOD_TYPE_OPTIONS = [
  { value: "delivery", label: "Giao tận nơi" },
  { value: "pickup", label: "Tự đến lấy" },
] as const;

export type DeliveryMethodType = (typeof DELIVERY_METHOD_TYPE_OPTIONS)[number]["value"];

/**
 * DeliveryMethod = lựa chọn giao/nhận hàng Admin cấu hình để hiển thị ở
 * Checkout — khác Shipment (theo dõi giao hàng thực tế sau khi đơn được tạo,
 * chưa xây trong Phase này). Không có DeliveryZone (phí theo quận/huyện) —
 * quyết định "Bắt đầu đơn giản": 1 baseFee cố định mỗi method, giống cách
 * checkout hiện tại phân theo within_5km/over_5km (xem
 * features/checkout/types/checkout.types.ts) thay vì tra cứu theo địa giới.
 */
export type ManagedDeliveryMethod = {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: DeliveryMethodType;
  baseFee: number;
  /** Đơn hàng đạt ngưỡng này thì miễn phí baseFee — bỏ trống = không áp dụng. */
  freeShippingThreshold?: number;
  estimatedMinMinutes?: number;
  estimatedMaxMinutes?: number;
  /** Chỉ có ý nghĩa khi type = "pickup". */
  pickupAddress?: string;
  displayOrder: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
