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

import type { AuthUser } from "../types/auth.types";

const AUTH_STORAGE_KEY = "tayho-auth";

/**
 * Phiên đăng nhập Site (khác AdminAuthProvider — features/admin-auth, dùng
 * cookie httpOnly cho Admin Portal). Site dùng localStorage, cùng mức độ tin
 * cậy với Cart (features/cart) — hệ thống auth hiện tại là MOCK CONTRACT
 * (chưa có backend/token thật), không phải nơi lưu thông tin nhạy cảm.
 *
 * Trước Phase 6, AuthUser chỉ là state tạm trong Header.tsx — mất khi reload,
 * khiến Order History (/tai-khoan/don-hang) không dùng được vì user phải
 * đăng nhập lại mỗi lần muốn xem đơn. Provider này lưu phiên qua localStorage
 * để khắc phục.
 */
type AuthContextType = {
  user: AuthUser | null;
  /** true khi đã đọc xong localStorage lúc khởi tạo — tránh flash "chưa đăng nhập" trước khi kịp hydrate. */
  isAuthLoaded: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);

      if (savedUser) {
        setUser(JSON.parse(savedUser) as AuthUser);
      }
    } catch (error) {
      console.error("Không thể đọc phiên đăng nhập:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  const login = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } catch (error) {
      console.error("Không thể lưu phiên đăng nhập:", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Không thể xóa phiên đăng nhập:", error);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthLoaded, login, logout }),
    [user, isAuthLoaded, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }

  return context;
}
