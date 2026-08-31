/**
 * OrderCode format CHUẨN nhưng CẤU HÌNH ĐƯỢC (Phase 0) — mặc định sinh dạng
 * "TH127-260831-00128" (prefix-yyMMdd-số thứ tự reset mỗi ngày), nhưng prefix/
 * cách format ngày/độ dài số thứ tự đều truyền qua OrderCodeConfig, không
 * hard-code rải rác. Đổi định dạng sau này chỉ cần sửa DEFAULT_ORDER_CODE_CONFIG
 * tại đây, không phải sửa order.service.ts.
 */
export type OrderCodeConfig = {
  prefix: string;
  formatDate: (date: Date) => string;
  sequenceLength: number;
};

function formatDateYyMmDd(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export const DEFAULT_ORDER_CODE_CONFIG: OrderCodeConfig = {
  prefix: "TH127",
  formatDate: formatDateYyMmDd,
  sequenceLength: 5,
};

/**
 * Số thứ tự reset theo từng ngày (theo datePart), không phải toàn cục — khớp
 * ví dụ "TH127-260831-00128" (đơn thứ 128 trong ngày 260831). Order cũ theo
 * format khác (vd. seed "DH00001") không khớp pattern nên không ảnh hưởng đến
 * việc đếm số thứ tự ngày hiện tại — đúng tinh thần Order Snapshot (#12): dữ
 * liệu lịch sử giữ nguyên, không bị hồi tố theo quy tắc mới.
 */
export function generateOrderCode(
  existing: Array<{ orderCode: string }>,
  now: Date = new Date(),
  config: OrderCodeConfig = DEFAULT_ORDER_CODE_CONFIG,
): string {
  const datePart = config.formatDate(now);
  const pattern = new RegExp(`^${config.prefix}-${datePart}-(\\d+)$`);

  const maxSequence = existing.reduce((max, order) => {
    const match = pattern.exec(order.orderCode);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  const sequence = String(maxSequence + 1).padStart(config.sequenceLength, "0");
  return `${config.prefix}-${datePart}-${sequence}`;
}
