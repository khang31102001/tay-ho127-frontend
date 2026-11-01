/**
 * Giờ mở cửa của chi nhánh chính: Backend chỉ có 1 cặp openTime/closeTime áp cho mọi ngày (chuỗi "HH:mm" hoặc
 * "HH:mm:ss"). Tính theo giờ Việt Nam, không theo múi giờ máy chủ/trình duyệt — container chạy UTC.
 */
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

export const WEEKDAY_LABELS = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"] as const;

export type OpenStatus = {
  isOpen: boolean;
  /** "Đóng lúc 21:30" khi đang mở, "Mở lại lúc 05:30" khi đang đóng. */
  detail: string;
};

/** "05:30:00" → "05:30". Rỗng/sai định dạng → null (nơi hiển thị tự ẩn). */
export function normalizeTime(value: string): string | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

type VietnamClock = {
  /** 0 = Thứ Hai … 6 = Chủ Nhật, khớp WEEKDAY_LABELS. */
  weekdayIndex: number;
  minutesOfDay: number;
};

function getVietnamClock(now: Date): VietnamClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return {
    weekdayIndex: Math.max(0, weekdays.indexOf(read("weekday"))),
    minutesOfDay: Number(read("hour")) * 60 + Number(read("minute")),
  };
}

export function getVietnamWeekdayIndex(now: Date = new Date()): number {
  return getVietnamClock(now).weekdayIndex;
}

/** Null khi Admin chưa nhập đủ giờ mở/đóng — không đoán trạng thái. Hỗ trợ giờ đóng qua nửa đêm. */
export function getOpenStatus(openTime: string, closeTime: string, now: Date = new Date()): OpenStatus | null {
  const opens = normalizeTime(openTime);
  const closes = normalizeTime(closeTime);
  if (!opens || !closes) return null;

  const current = getVietnamClock(now).minutesOfDay;
  const openMinutes = toMinutes(opens);
  const closeMinutes = toMinutes(closes);
  const isOpen =
    openMinutes <= closeMinutes
      ? current >= openMinutes && current < closeMinutes
      : current >= openMinutes || current < closeMinutes;

  return isOpen ? { isOpen, detail: `Đóng lúc ${closes}` } : { isOpen, detail: `Mở lại lúc ${opens}` };
}
