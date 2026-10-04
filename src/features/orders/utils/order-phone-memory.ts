/**
 * Trang theo dõi đơn (/don-hang/{mã}) chỉ cho xem khi biết CẢ mã đơn lẫn SĐT đặt hàng (Backend chặn người lạ dò mã). Vừa đặt
 * xong thì trình duyệt này đã biết SĐT — nhớ lại (localStorage, tối đa MAX_ENTRIES đơn gần nhất) để khách khỏi nhập lại; mở
 * link từ máy khác thì trang sẽ hỏi SĐT. Chỉ lưu SĐT của chính khách trên chính máy họ, không có token hay dữ liệu nhạy cảm.
 */
const STORAGE_KEY = "tayho-order-phones";
const MAX_ENTRIES = 20;

type PhoneByOrderCode = Record<string, string>;

function readMemory(): PhoneByOrderCode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as PhoneByOrderCode) : {};
  } catch {
    return {};
  }
}

export function rememberOrderPhone(orderCode: string, phone: string): void {
  if (typeof window === "undefined") return;

  try {
    const memory = readMemory();
    delete memory[orderCode];
    const entries = Object.entries({ ...memory, [orderCode]: phone }).slice(-MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch (error) {
    console.error("Không thể lưu số điện thoại của đơn hàng:", error);
  }
}

export function recallOrderPhone(orderCode: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return readMemory()[orderCode];
}
