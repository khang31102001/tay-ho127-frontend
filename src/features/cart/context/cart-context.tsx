"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CartContextType,
  CartItem,
  CartItemModifierSelection,
  CartProduct,
  UtensilsPreference,
} from "../types/cart.types";
import {
  addCartItem as addCartItemToList,
  calculateCartCount,
  calculateCartTotalPrice,
  calculateOrderOptionsSurcharge,
  DEFAULT_CART_PREFERENCES,
  readCartFromStorage,
  readCartPreferencesFromStorage,
  removeCartItem as removeCartItemFromList,
  updateCartItemQuantity,
  updateCartItemSpecialInstructions,
  writeCartToStorage,
  writeCartPreferencesToStorage,
} from "../services/cart.service";

type CartProviderProps = {
  children: ReactNode;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Order-level preferences chọn ở Cart Page — xem CartContextType.
  const [deliveryMethodId, setDeliveryMethodId] = useState("");
  const [address, setAddress] = useState("");
  const [utensils, setUtensils] = useState<UtensilsPreference>("yes");
  const [note, setNote] = useState("");
  const [orderOptionSelections, setOrderOptionSelections] = useState<CartItemModifierSelection[]>([]);
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);

  // Đọc giỏ hàng đã lưu khi ứng dụng được tải.
  useEffect(() => {
    setCartItems(readCartFromStorage());
    setIsCartLoaded(true);
  }, []);

  // Chỉ lưu sau khi đã đọc xong dữ liệu cũ.
  useEffect(() => {
    if (!isCartLoaded) {
      return;
    }

    writeCartToStorage(cartItems);
  }, [cartItems, isCartLoaded]);

  // Đọc preferences đã lưu — refresh /gio-hang không làm mất lựa chọn đã nhập.
  useEffect(() => {
    const preferences = readCartPreferencesFromStorage();
    setDeliveryMethodId(preferences.deliveryMethodId);
    setAddress(preferences.address);
    setUtensils(preferences.utensils);
    setNote(preferences.note);
    setOrderOptionSelections(preferences.orderOptionSelections);
    setIsPreferencesLoaded(true);
  }, []);

  // Chỉ lưu sau khi đã đọc xong dữ liệu cũ.
  useEffect(() => {
    if (!isPreferencesLoaded) {
      return;
    }

    writeCartPreferencesToStorage({ deliveryMethodId, address, utensils, note, orderOptionSelections });
  }, [isPreferencesLoaded, deliveryMethodId, address, utensils, note, orderOptionSelections]);

  const addToCart = useCallback((product: CartProduct) => {
    setCartItems((currentItems) => addCartItemToList(currentItems, product));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((currentItems) => removeCartItemFromList(currentItems, productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((currentItems) => updateCartItemQuantity(currentItems, productId, quantity));
  }, []);

  const updateCartItemNote = useCallback((cartItemId: string, note: string) => {
    setCartItems((currentItems) => updateCartItemSpecialInstructions(currentItems, cartItemId, note));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    // Đơn hàng đã tạo xong — reset luôn preferences để không mang sang đơn kế tiếp.
    setDeliveryMethodId(DEFAULT_CART_PREFERENCES.deliveryMethodId);
    setAddress(DEFAULT_CART_PREFERENCES.address);
    setUtensils(DEFAULT_CART_PREFERENCES.utensils);
    setNote(DEFAULT_CART_PREFERENCES.note);
    setOrderOptionSelections(DEFAULT_CART_PREFERENCES.orderOptionSelections);
  }, []);

  const cartCount = useMemo(() => calculateCartCount(cartItems), [cartItems]);

  /** Tổng tiền món + phụ phí General Order Options (cộng 1 lần cho cả đơn, xem calculateOrderOptionsSurcharge). */
  const totalPrice = useMemo(
    () => calculateCartTotalPrice(cartItems) + calculateOrderOptionsSurcharge(orderOptionSelections),
    [cartItems, orderOptionSelections],
  );

  const value = useMemo<CartContextType>(
    () => ({
      cartItems,
      cartCount,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItemNote,
      clearCart,
      deliveryMethodId,
      setDeliveryMethodId,
      address,
      setAddress,
      utensils,
      setUtensils,
      note,
      setNote,
      orderOptionSelections,
      setOrderOptionSelections,
    }),
    [
      cartItems,
      cartCount,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItemNote,
      clearCart,
      deliveryMethodId,
      address,
      utensils,
      note,
      orderOptionSelections,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart phải được sử dụng bên trong CartProvider",
    );
  }

  return context;
}
