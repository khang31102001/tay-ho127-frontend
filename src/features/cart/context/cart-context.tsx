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

const CART_STORAGE_KEY = "tayho-cart";

type CartProviderProps = {
  children: ReactNode;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Đọc giỏ hàng đã lưu khi ứng dụng được tải.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart as CartItem[]);
        }
      }
    } catch (error) {
      console.error("Không thể đọc dữ liệu giỏ hàng:", error);
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsCartLoaded(true);
    }
  }, []);

  // Chỉ lưu sau khi đã đọc xong dữ liệu cũ.
  useEffect(() => {
    if (!isCartLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems),
      );
    } catch (error) {
      console.error("Không thể lưu dữ liệu giỏ hàng:", error);
    }
  }, [cartItems, isCartLoaded]);

  const addToCart = useCallback((product: CartProduct) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity,
              }
            : item,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    [cartItems],
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [cartItems],
  );

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