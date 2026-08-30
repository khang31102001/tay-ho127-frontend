"use client";

import type { ReactNode } from "react";
import { CartProvider, FlyToCartProvider, MiniCartProvider } from "@/features/cart";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <CartProvider>
      <FlyToCartProvider>
        <MiniCartProvider>
          {children}
        </MiniCartProvider>
      </FlyToCartProvider>
    </CartProvider>
  );
}