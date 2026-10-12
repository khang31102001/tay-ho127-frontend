"use client";

import type { ReactNode } from "react";
import { CartProvider, FlyToCartProvider, MiniCartProvider } from "@/features/cart";
import { AuthProvider, useAuth } from "@/features/auth";
import { AppInitLoading } from "@/shared/components/loading/AppInitLoading";
import { site } from "@/core/config/site-data";
import { FavoritesProvider } from "@/features/favorites";

type AppProvidersProps = {
  children: ReactNode;
};

// Initial Loading của User Site: chờ phiên khách hàng được khôi phục (useAuth).
function SiteInitLoading() {
  const { isAuthLoaded } = useAuth();

  return <AppInitLoading isReady={isAuthLoaded} logoSrc={site.assets.logoColor} title={site.name} />;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <FlyToCartProvider>
          <MiniCartProvider>
            <FavoritesProvider>
              {children}
              <SiteInitLoading />
            </FavoritesProvider>
          </MiniCartProvider>
        </FlyToCartProvider>
      </CartProvider>
    </AuthProvider>
  );
}