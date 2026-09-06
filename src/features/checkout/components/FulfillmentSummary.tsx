import type { ManagedDeliveryMethod } from "@/features/delivery-methods";

type FulfillmentSummaryProps = {
  selectedMethod: ManagedDeliveryMethod | undefined;
  address: string;
  isLoading: boolean;
};

function formatEstimate(minMinutes?: number, maxMinutes?: number): string | null {
  if (minMinutes === undefined && maxMinutes === undefined) return null;
  if (minMinutes !== undefined && maxMinutes !== undefined) return `${minMinutes}–${maxMinutes} phút`;
  return `${minMinutes ?? maxMinutes} phút`;
}

/**
 * #7 FULFILLMENT — bản READ-ONLY: chỉ hiển thị lại lựa chọn khách đã chọn ở
 * Cart Page (features/cart, CartContext) để review trước khi đặt hàng.
 * KHÔNG có radio/input — muốn đổi phải quay lại /gio-hang (Checkout không sở
 * hữu state/UI chỉnh sửa mục này nữa, xem FulfillmentSelector trong
 * features/cart/components). Không tự bọc outer card — được compose bên
 * trong OrderInformationSection.
 */
export function FulfillmentSummary({ selectedMethod, address, isLoading }: FulfillmentSummaryProps) {
  return (
    <div>
      <h3 className="mb-3 text-[14px] font-black text-brand-greenDark">Cách nhận hàng</h3>

      {isLoading || !selectedMethod ? (
        <p className="text-[13px] text-[#4b4b4b]">Đang tải hình thức nhận hàng...</p>
      ) : (
        <div className="space-y-1 text-[13px] text-brand-greenDark">
          <p className="font-bold">{selectedMethod.type === "pickup" ? "Nhận tại quán" : "Giao hàng tận nơi"}</p>

          <p className="text-[#4b4b4b]">
            {selectedMethod.name}
            {formatEstimate(selectedMethod.estimatedMinMinutes, selectedMethod.estimatedMaxMinutes) && (
              <span> · {formatEstimate(selectedMethod.estimatedMinMinutes, selectedMethod.estimatedMaxMinutes)}</span>
            )}
          </p>

          <p className="text-[#4b4b4b]">
            {selectedMethod.type === "pickup" ? (selectedMethod.pickupAddress ?? selectedMethod.name) : address}
          </p>
        </div>
      )}
    </div>
  );
}
