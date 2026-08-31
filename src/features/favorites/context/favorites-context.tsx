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

import {
  readFavoritesFromStorage,
  writeFavoritesToStorage,
} from "../services/favorite.service";

export interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

type FavoritesProviderProps = {
  children: ReactNode;
};

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Đọc danh sách yêu thích đã lưu khi ứng dụng được tải.
  useEffect(() => {
    setFavoriteIds(readFavoritesFromStorage());
    setIsLoaded(true);
  }, []);

  // Chỉ lưu sau khi đã đọc xong dữ liệu cũ.
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    writeFavoritesToStorage(favoriteIds);
  }, [favoriteIds, isLoaded]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const value = useMemo<FavoritesContextType>(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites phải được sử dụng bên trong FavoritesProvider");
  }

  return context;
}
