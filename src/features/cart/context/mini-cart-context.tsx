"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Trạng thái mở/đóng của Mini Cart dropdown (bottom sheet trên mobile).
 * Đây KHÔNG phải cart items state (vẫn chỉ có 1 nguồn duy nhất là
 * CartProvider/useCart) — chỉ là UI state để nhiều trigger (Header cart,
 * Floating cart, cart trong menu mobile) cùng điều khiển một Mini Cart
 * duy nhất và đảm bảo chỉ có 1 Mini Cart mở tại một thời điểm.
 */
type MiniCartContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const MiniCartContext = createContext<MiniCartContextType | null>(null);

export function MiniCartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  const value = useMemo<MiniCartContextType>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <MiniCartContext.Provider value={value}>
      {children}
    </MiniCartContext.Provider>
  );
}

export function useMiniCart(): MiniCartContextType {
  const context = useContext(MiniCartContext);

  if (!context) {
    throw new Error("useMiniCart phải được sử dụng bên trong MiniCartProvider");
  }

  return context;
}
