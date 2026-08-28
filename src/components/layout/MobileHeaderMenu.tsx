"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogIn,
  Menu,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useFlyToCart } from "@/features/cart";
import type { AuthUser } from "@/features/auth";

type NavItem = {
  href: string;
  label: string;
};

type MobileHeaderMenuProps = {
  navItems: NavItem[];
  currentUser: AuthUser | null;
  cartCount: number;
  onLoginClick: () => void;
  onCartClick: () => void;
  isDark?: boolean;
};

export default function MobileHeaderMenu({
  navItems,
  currentUser,
  cartCount,
  onLoginClick,
  onCartClick,
  isDark = false,
}: MobileHeaderMenuProps) {
  const pathname = usePathname();

  const { registerCartTarget } = useFlyToCart();

  const [menuOpen, setMenuOpen] = useState(false);

  // ============================================================
  // Close menu when route changes
  // ============================================================

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // ============================================================
  // Prevent body scroll while menu is open
  // ============================================================

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuOpen]);

  function handleLoginClick() {
    setMenuOpen(false);
    onLoginClick();
  }

  function handleCartClick() {
    setMenuOpen(false);
    onCartClick();
  }

  return (
    <div className="md:hidden">
      {/* ========================================================
          Top row: Cart (quick access) + Menu Trigger
      ======================================================== */}

      <div className="flex items-center gap-1">
        {cartCount > 0 && (
          <button
            data-cart-target
            ref={(element) => registerCartTarget("mobile", element)}
            type="button"
            onClick={handleCartClick}
            aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
            className={`
              relative flex size-11 items-center justify-center rounded-full
              transition-colors duration-200
              ${
                isDark
                  ? "text-white hover:bg-white/10"
                  : "text-brand-greenDark hover:bg-black/5"
              }
            `}
          >
            <ShoppingCart className="size-[18px]" />

            <span
              className="
                absolute right-1.5 top-1.5
                flex min-h-[16px] min-w-[16px] items-center justify-center
                rounded-full bg-orange-500 px-1
                text-[9px] font-bold leading-none text-white
              "
            >
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((previousState) => !previousState)}
          className={`
            flex size-11 items-center justify-center rounded-full
            transition-colors duration-200
            ${
              isDark
                ? "text-white hover:bg-white/10"
                : "text-brand-greenDark hover:bg-black/5"
            }
          `}
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? (
            <X className="size-6" />
          ) : (
            <Menu className="size-6" />
          )}
        </button>
      </div>

      {/* ========================================================
          Backdrop
      ======================================================== */}

      {menuOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMenuOpen(false)}
          className="
            fixed inset-x-0 bottom-0 top-[86px]
            z-40 bg-black/30 backdrop-blur-[2px]
          "
        />
      )}

      {/* ========================================================
          Mobile Navigation
      ======================================================== */}

      <div
        id="mobile-navigation"
        className={`
          absolute left-0 top-full z-50 w-full
          overflow-hidden
          transition-all duration-300 ease-out
          ${
            menuOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-3 opacity-0"
          }
          ${
            isDark
              ? "border-t border-white/10 bg-brand-greenDark text-white"
              : "border-t border-black/5 bg-brand-cream text-brand-greenDark"
          }
        `}
      >
        <div className="mx-auto w-full px-5 pb-6 pt-3">
          {/* Navigation */}
          <nav
            className="flex flex-col"
            aria-label="Điều hướng trên thiết bị di động"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex min-h-14 items-center
                    border-b py-3
                    text-[16px] font-bold
                    transition-opacity hover:opacity-70
                    ${
                      isDark
                        ? "border-white/10"
                        : "border-brand-greenDark/10"
                    }
                    ${isActive ? "opacity-100" : "opacity-80"}
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ====================================================
              Account
          ==================================================== */}

          <button
            type="button"
            onClick={handleLoginClick}
            className={`
              mt-4 flex w-full items-center gap-3
              rounded-xl px-4 py-3.5
              text-left text-[15px] font-bold
              transition-colors
              ${
                isDark
                  ? "bg-white/10 hover:bg-white/15"
                  : "bg-brand-greenDark/5 hover:bg-brand-greenDark/10"
              }
            `}
          >
            <span
              className={`
                flex size-10 shrink-0 items-center justify-center
                rounded-full
                ${
                  isDark
                    ? "bg-white/10"
                    : "bg-brand-greenDark/10"
                }
              `}
            >
              {currentUser ? (
                <UserRound className="size-5" />
              ) : (
                <LogIn className="size-5" />
              )}
            </span>

            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium opacity-60">
                {currentUser ? "Tài khoản" : "Thành viên"}
              </span>

              <span className="truncate">
                {currentUser
                  ? currentUser.name
                  : "Đăng nhập"}
              </span>
            </span>
          </button>

          {/* ====================================================
              Cart
          ==================================================== */}

          {cartCount > 0 && (
            <button
              type="button"
              onClick={handleCartClick}
              className={`
                mt-3 flex w-full items-center justify-between
                rounded-xl px-4 py-3.5
                text-[15px] font-bold
                transition-colors
                ${
                  isDark
                    ? "bg-white/10 hover:bg-white/15"
                    : "bg-brand-greenDark/5 hover:bg-brand-greenDark/10"
                }
              `}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`
                    flex size-10 items-center justify-center
                    rounded-full
                    ${
                      isDark
                        ? "bg-white/10"
                        : "bg-brand-greenDark/10"
                    }
                  `}
                >
                  <ShoppingCart className="size-5" />
                </span>

                Giỏ hàng
              </span>

              <span
                className="
                  flex min-h-6 min-w-6 items-center justify-center
                  rounded-full bg-orange-500 px-1.5
                  text-xs font-bold text-white
                "
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}