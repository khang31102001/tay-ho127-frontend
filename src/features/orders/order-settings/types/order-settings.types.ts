/** Phần ngày trong mã đơn — số thứ tự chạy lại từ 1 mỗi khi phần ngày đổi ("none" = không có phần ngày, đánh số liên tục). */
export const ORDER_CODE_DATE_FORMAT_OPTIONS = [
  { value: "yyMMdd", label: "Ngày — yyMMdd (TH127-260831-00128, đánh lại số mỗi ngày)" },
  { value: "yyyyMMdd", label: "Ngày — yyyyMMdd (TH127-20260831-00128, đánh lại số mỗi ngày)" },
  { value: "yyMM", label: "Tháng — yyMM (TH127-2608-00128, đánh lại số mỗi tháng)" },
  { value: "none", label: "Không có ngày (TH127-00128, đánh số liên tục)" },
] as const;

export type OrderCodeDateFormat = (typeof ORDER_CODE_DATE_FORMAT_OPTIONS)[number]["value"];

/**
 * Cấu hình chung của đơn hàng (Backend /api/v1/sales/order-settings, một bản ghi duy nhất): cách sinh mã đơn và thời gian giữ
 * chỗ của phiên thanh toán QR/ví. Đổi cấu hình chỉ áp dụng cho đơn đặt SAU ĐÓ — mã đơn cũ không đổi.
 */
export type ManagedOrderSettings = {
  /** Chữ/số đứng đầu mã đơn, Backend tự viết hoa ("TH127"). */
  orderCodePrefix: string;
  orderCodeDateFormat: OrderCodeDateFormat;
  /** Độ rộng phần số thứ tự (3–8), đệm số 0 ở trước ("00128" = 5). */
  orderCodeSequenceLength: number;
  /** Phiên thanh toán giữ chỗ bao lâu trước khi tự hủy (5–240 phút). */
  paymentSessionMinutes: number;
  /** Ví dụ mã đơn theo cấu hình hiện tại (Backend dựng). */
  exampleOrderCode: string;
  updatedAt: string;
};

export type OrderSettingsFormValue = Omit<ManagedOrderSettings, "exampleOrderCode" | "updatedAt">;
