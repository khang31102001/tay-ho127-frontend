"use client";

import type { ReactNode } from "react";
import { CartProvider, FlyToCartProvider, MiniCartProvider } from "@/features/cart";
import { AuthProvider } from "@/features/auth";
import { FavoritesProvider } from "@/features/favorites";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <FlyToCartProvider>
          <MiniCartProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </MiniCartProvider>
        </FlyToCartProvider>
      </CartProvider>
    </AuthProvider>
  );
}