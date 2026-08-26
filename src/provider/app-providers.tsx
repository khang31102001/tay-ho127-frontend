"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/contexts/cart-context";
import { FlyToCartProvider } from "@/contexts/fly-to-cart-context";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <CartProvider>
      <FlyToCartProvider>
        {children}
      </FlyToCartProvider>
    </CartProvider>
  );
}