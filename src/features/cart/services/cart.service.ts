import type { CartItem, CartItemModifierSelection, CartProduct, UtensilsPreference } from "../types/cart.types";

const CART_STORAGE_KEY = "tayho-cart";
const CART_PREFERENCES_STORAGE_KEY = "tayho-cart-preferences";

/**
 * Cart hiện tại là state thuần phía trình duyệt (chưa có Backend Cart thật) —
 * tách logic đọc/ghi localStorage + biến đổi CartItem[] ra khỏi CartProvider
 * (context chỉ còn giữ React state + gọi các hàm thuần dưới đây), theo đúng
 * layer Component → Hook/Context → Service đang áp dụng cho các feature khác.
 * Khi có Backend Cart thật, chỉ cần thay nội dung các hàm này (gọi API thay
 * vì localStorage) — CartProvider và mọi component tiêu thụ (Header, MiniCart,
 * FloatingCartBar, Checkout...) không cần sửa.
 */
/**
 * Loại bỏ dòng giỏ hàng lỗi thời/hỏng — chủ yếu là giỏ hàng được lưu từ trước
 * khi `CartProduct.id` đổi tên thành `productId` (xem cart.types.ts), nên
 * thiếu `productId`. Bỏ qua âm thầm dòng lỗi thay vì để cả giỏ hàng crash khi
 * Đặt hàng (cùng nguyên tắc với resolveOrderItemModifiers ở order.service.ts).
 */
/** Giỏ hàng lưu trước khi có `basePrice` chỉ có `price` (đã cộng modifier) — chấp nhận cả 2 shape, migrateLegacyCartItem xử lý suy ngược basePrice. */
function isValidCartItem(item: unknown): item is CartItem & { price?: number } {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<CartItem> & { price?: unknown };

  const hasValidPrice = typeof candidate.basePrice === "number" || typeof candidate.price === "number";

  return (
    typeof candidate.id === "string" &&
    typeof candidate.productId === "string" &&
    candidate.productId.length > 0 &&
    typeof candidate.name === "string" &&
    hasValidPrice &&
    typeof candidate.image === "string" &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0
  );
}

/**
 * Cart lưu trước khi CartProduct có `basePrice` (xem cart.types.ts) chỉ có
 * `price` = giá ĐÃ cộng priceAdjustment của modifier. Suy ngược basePrice
 * bằng cách trừ lại tổng priceAdjustment — tránh cộng dồn modifier 2 lần khi
 * calculateCartItemUnitPrice chạy trên dữ liệu cũ, không cần xóa giỏ hàng cũ
 * của khách khi họ mở lại site sau khi cập nhật.
 */
function migrateLegacyCartItem(item: CartItem & { price?: number }): CartItem {
  if (typeof item.basePrice === "number") {
    return item;
  }

  const legacyPrice = item.price ?? 0;
  const modifiersTotal = (item.modifiers ?? []).reduce((sum, modifier) => sum + modifier.priceAdjustment, 0);

  return { ...item, basePrice: legacyPrice - modifiersTotal };
}

export function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isValidCartItem).map(migrateLegacyCartItem) : [];
  } catch (error) {
    console.error("Không thể đọc dữ liệu giỏ hàng:", error);
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Không thể lưu dữ liệu giỏ hàng:", error);
  }
}

/**
 * Ghép productId + chữ ký các optionId đã chọn (sắp xếp ổn định) thành 1 dòng
 * giỏ hàng duy nhất — không có modifier thì trùng luôn với productId, giữ
 * đúng hành vi gộp số lượng cũ.
 */
export function buildCartItemId(productId: string, modifiers: CartItem["modifiers"] = []): string {
  if (!modifiers || modifiers.length === 0) {
    return productId;
  }

  const signature = modifiers
    .map((modifier) => modifier.optionId)
    .sort()
    .join("|");

  return `${productId}::${signature}`;
}

export function addCartItem(items: CartItem[], product: CartProduct): CartItem[] {
  const cartItemId = buildCartItemId(product.productId, product.modifiers);
  const existingItem = items.find((item) => item.id === cartItemId);

  if (existingItem) {
    return items.map((item) => (item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item));
  }

  return [...items, { ...product, id: cartItemId, quantity: 1 }];
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.id !== productId);
}

export function updateCartItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return removeCartItem(items, productId);
  }

  return items.map((item) => (item.id === productId ? { ...item, quantity } : item));
}

export function calculateCartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/** Cộng dồn priceAdjustment của các modifier đã chọn vào giá gốc — hàm DUY NHẤT tính unitPrice, dùng chung mọi nơi (Mini Cart/Cart Page/Checkout). */
export function calculateCartItemUnitPrice(product: CartProduct): number {
  const modifiersTotal = (product.modifiers ?? []).reduce((sum, modifier) => sum + modifier.priceAdjustment, 0);
  return product.basePrice + modifiersTotal;
}

export function calculateCartItemTotal(item: CartItem): number {
  return calculateCartItemUnitPrice(item) * item.quantity;
}

export function calculateCartTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + calculateCartItemTotal(item), 0);
}

/** Tổng priceAdjustment của General Order Options đã chọn — cộng 1 LẦN vào tổng đơn (không nhân theo quantity món nào), xem cart-context.tsx `totalPrice`. */
export function calculateOrderOptionsSurcharge(selections: CartItemModifierSelection[]): number {
  return selections.reduce((sum, selection) => sum + selection.priceAdjustment, 0);
}

/**
 * Delivery Method + Order Preferences (deliveryMethodId/address/utensils/note)
 * — chọn ở Cart Page, cần đọc lại nguyên vẹn ở Checkout để tạo Order. Lưu
 * localStorage cùng cơ chế với CartItem[] ở trên để refresh /gio-hang không
 * làm mất lựa chọn đã nhập (dù CartContext chỉ giữ React state trong lúc
 * chạy — persistence là trách nhiệm riêng của service layer).
 */
export interface CartPreferences {
  deliveryMethodId: string;
  address: string;
  utensils: UtensilsPreference;
  note: string;
  /** General Order Options đã chọn (Nước mắm/Rau...) — xem cart.types.ts CartContextType.orderOptionSelections. */
  orderOptionSelections: CartItemModifierSelection[];
}

export const DEFAULT_CART_PREFERENCES: CartPreferences = {
  deliveryMethodId: "",
  address: "",
  utensils: "yes",
  note: "",
  orderOptionSelections: [],
};

/** `orderOptionSelections` thêm sau — preferences lưu trước đó không có field này, coi là hợp lệ và mặc định `[]` (xem readCartPreferencesFromStorage). */
function isValidCartPreferences(value: unknown): value is Omit<CartPreferences, "orderOptionSelections"> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CartPreferences>;

  return (
    typeof candidate.deliveryMethodId === "string" &&
    typeof candidate.address === "string" &&
    (candidate.utensils === "yes" || candidate.utensils === "no") &&
    typeof candidate.note === "string"
  );
}

export function readCartPreferencesFromStorage(): CartPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_CART_PREFERENCES;
  }

  try {
    const saved = localStorage.getItem(CART_PREFERENCES_STORAGE_KEY);
    if (!saved) return DEFAULT_CART_PREFERENCES;

    const parsed: unknown = JSON.parse(saved);
    if (!isValidCartPreferences(parsed)) return DEFAULT_CART_PREFERENCES;

    const candidate = parsed as Partial<CartPreferences>;
    return {
      ...parsed,
      orderOptionSelections: Array.isArray(candidate.orderOptionSelections) ? candidate.orderOptionSelections : [],
    };
  } catch (error) {
    console.error("Không thể đọc tùy chọn giỏ hàng:", error);
    localStorage.removeItem(CART_PREFERENCES_STORAGE_KEY);
    return DEFAULT_CART_PREFERENCES;
  }
}

export function writeCartPreferencesToStorage(preferences: CartPreferences): void {
  try {
    localStorage.setItem(CART_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Không thể lưu tùy chọn giỏ hàng:", error);
  }
}
