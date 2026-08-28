"use client";

import type { ReactNode } from "react";
import { CartProvider, FlyToCartProvider } from "@/features/cart";

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