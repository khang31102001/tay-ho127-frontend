import type { CartItem, CartProduct } from "../types/cart.types";

const CART_STORAGE_KEY = "tayho-cart";

/**
 * Cart hiện tại là state thuần phía trình duyệt (chưa có Backend Cart thật) —
 * tách logic đọc/ghi localStorage + biến đổi CartItem[] ra khỏi CartProvider
 * (context chỉ còn giữ React state + gọi các hàm thuần dưới đây), theo đúng
 * layer Component → Hook/Context → Service đang áp dụng cho các feature khác.
 * Khi có Backend Cart thật, chỉ cần thay nội dung các hàm này (gọi API thay
 * vì localStorage) — CartProvider và mọi component tiêu thụ (Header, MiniCart,
 * FloatingCartBar, Checkout...) không cần sửa.
 */
export function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
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
function buildCartItemId(productId: string, modifiers: CartItem["modifiers"] = []): string {
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

export function calculateCartTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
