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
import { getAdminSession, logoutAdmin } from "../services/admin-auth.service";

type AdminAuthContextType = {
  user: AdminUser | null;
  /**
   * true khi đã hỏi xong phiên hiện tại (GET /api/admin/auth/session).
   * Dùng để tránh AdminGuard redirect nhầm trước khi kịp khôi phục phiên.
   */
  isAuthLoaded: boolean;
  login: (user: AdminUser) => void;
  /** Thu hồi phiên ở Backend + xóa cookie, xong mới xóa user khỏi context. */
  logout: () => Promise<void>;
  /** Admin có quyền Backend `permissionCode` (vd. "users.create") hay không. */
  hasPermission: (permissionCode: string) => boolean;
};

type AdminAuthProviderProps = {
  children: ReactNode;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

/**
 * Phiên đăng nhập Admin. Nguồn sự thật là cookie HttpOnly do BFF quản lý —
 * context chỉ giữ bản sao hồ sơ/quyền trong bộ nhớ, khôi phục khi tải trang
 * bằng cách hỏi BFF (không lưu gì vào localStorage).
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    getAdminSession()
      .then((sessionUser) => {
        if (!isCancelled) setUser(sessionUser);
      })
      .catch((error) => {
        console.error("Không thể khôi phục phiên đăng nhập admin:", error);
      })
      .finally(() => {
        if (!isCancelled) setIsAuthLoaded(true);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = useCallback((nextUser: AdminUser) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    // Chờ BFF xóa cookie phiên TRƯỚC khi điều hướng: còn cookie thì middleware.ts
    // sẽ đẩy /admin/login ngược về /admin.
    try {
      await logoutAdmin();
    } catch (error) {
      console.error("Không thể đăng xuất phiên admin:", error);
    } finally {
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permissionCode: string) => user?.permissions.includes(permissionCode) ?? false,
    [user],
  );

  const value = useMemo<AdminAuthContextType>(
    () => ({ user, isAuthLoaded, login, logout, hasPermission }),
    [user, isAuthLoaded, login, logout, hasPermission],
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
