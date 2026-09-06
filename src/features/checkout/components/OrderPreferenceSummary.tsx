import type { UtensilsPreference } from "@/features/cart";

type OrderPreferenceSummaryProps = {
  utensils: UtensilsPreference;
  note: string;
};

/**
 * #6 ORDER-LEVEL OPTIONS — bản READ-ONLY: chỉ hiển thị lại lựa chọn khách đã
 * chọn ở Cart Page (features/cart, CartContext) để review trước khi đặt
 * hàng. KHÔNG có radio/textarea — muốn đổi phải quay lại /gio-hang (xem
 * GeneralOrderOptions showOrderPreferences trong features/cart/components).
 * Không tự bọc outer card — được compose bên trong OrderInformationSection.
 */
export function OrderPreferenceSummary({ utensils, note }: OrderPreferenceSummaryProps) {
  return (
    <div>
      <h3 className="mb-3 text-[14px] font-black text-brand-greenDark">Tùy chọn đơn hàng</h3>

      <div className="space-y-1 text-[13px] text-brand-greenDark">
        <p>
          <span className="font-bold">Dụng cụ ăn uống: </span>
          {utensils === "yes" ? "Có" : "Không"}
        </p>

        <p>
          <span className="font-bold">Ghi chú: </span>
          <span className="text-[#4b4b4b]">{note.trim() || "Không có"}</span>
        </p>
      </div>
    </div>
  );
}
