"use client";

import type { ReactNode } from "react";
import { CartProvider, FlyToCartProvider, MiniCartProvider } from "@/features/cart";
import { AuthProvider } from "@/features/auth";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <FlyToCartProvider>
          <MiniCartProvider>
            {children}
          </MiniCartProvider>
        </FlyToCartProvider>
      </CartProvider>
    </AuthProvider>
  );
}