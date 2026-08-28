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

import type { AdminUser } from "../types/admin-auth.types";

const ADMIN_AUTH_STORAGE_KEY = "tayho-admin-auth";

type AdminAuthContextType = {
  user: AdminUser | null;
  /**
   * true khi đã đọc xong localStorage lúc khởi tạo.
   * Dùng để tránh AdminGuard redirect nhầm trước khi kịp hydrate.
   */
  isAuthLoaded: boolean;
  login: (user: AdminUser) => void;
  logout: () => void;
};

type AdminAuthProviderProps = {
  children: ReactNode;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Đọc phiên đăng nhập admin đã lưu khi ứng dụng được tải.
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);

      if (savedUser) {
        setUser(JSON.parse(savedUser) as AdminUser);
      }
    } catch (error) {
      console.error("Không thể đọc phiên đăng nhập admin:", error);
      localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  const login = useCallback((nextUser: AdminUser) => {
    setUser(nextUser);

    try {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } catch (error) {
      console.error("Không thể lưu phiên đăng nhập admin:", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);

    try {
      localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Không thể xóa phiên đăng nhập admin:", error);
    }
  }, []);

  const value = useMemo<AdminAuthContextType>(
    () => ({ user, isAuthLoaded, login, logout }),
    [user, isAuthLoaded, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth phải được sử dụng bên trong AdminAuthProvider");
  }

  return context;
}
