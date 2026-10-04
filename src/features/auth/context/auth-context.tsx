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

import { fetchSessionUser, logoutSession } from "../services/auth.service";
import type { AuthUser } from "../types/auth.types";

/**
 * Phiên đăng nhập KHÁCH HÀNG của Site (khác AdminAuthProvider — features/admin-auth, dành cho Admin Portal). Nguồn sự thật
 * là cookie HttpOnly do BFF giữ (token của Backend): provider này chỉ hỏi máy chủ "tôi đang là ai" khi tải trang
 * (/api/customer/session) và giữ kết quả trong state — không tự lưu thông tin đăng nhập ở localStorage.
 */
type AuthContextType = {
  user: AuthUser | null;
  /** true khi đã biết kết quả khôi phục phiên (đã đăng nhập hay chưa) — tránh flash "chưa đăng nhập" trước khi kịp hỏi máy chủ. */
  isAuthLoaded: boolean;
  /** Ghi nhận khách vừa đăng nhập/đăng ký thành công (cookie đã được máy chủ ghi). */
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
    let isCancelled = false;

    fetchSessionUser().then((sessionUser) => {
      if (isCancelled) return;
      setUser(sessionUser);
      setIsAuthLoaded(true);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    void logoutSession();
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
