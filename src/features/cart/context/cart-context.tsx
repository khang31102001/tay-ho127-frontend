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
  CartProduct,
} from "../types/cart.types";
import {
  addCartItem as addCartItemToList,
  calculateCartCount,
  calculateCartTotalPrice,
  readCartFromStorage,
  removeCartItem as removeCartItemFromList,
  updateCartItemQuantity,
  writeCartToStorage,
} from "../services/cart.service";

type CartProviderProps = {
  children: ReactNode;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

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

  const addToCart = useCallback((product: CartProduct) => {
    setCartItems((currentItems) => addCartItemToList(currentItems, product));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((currentItems) => removeCartItemFromList(currentItems, productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((currentItems) => updateCartItemQuantity(currentItems, productId, quantity));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(() => calculateCartCount(cartItems), [cartItems]);

  const totalPrice = useMemo(() => calculateCartTotalPrice(cartItems), [cartItems]);

  const value = useMemo<CartContextType>(
    () => ({
      cartItems,
      cartCount,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [
      cartItems,
      cartCount,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
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
