"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import {
  CartTrigger,
  FloatingCart,
  MiniCart,
  useCart,
  useFlyToCart,
  useMiniCart,
} from "@/features/cart";
import { useScrollThreshold } from "@/hooks/useScrollThreshold";
import { AuthModal, useAuth, type AuthUser } from "@/features/auth";

import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import MobileHeaderMenu from "./MobileHeaderMenu";
// Import thẳng hook + type (không qua barrel @/features/navigation) — barrel
// đó re-export cả Explorer/Editor/Tree admin (UI "use client"), import qua
// barrel ở Header (Site) sẽ kéo UI admin vào bundle Site.
import { useLiveNavigation } from "@/features/navigation/hooks/useLiveNavigation";
import type { NavigationItem } from "@/features/navigation/types/navigation.types";

/* =================================================
 * TYPES
 * =============================================== */

type HeaderProps = {
  variant?: "dark" | "light";
  /**
   * Lấy động từ Navigation module (features/navigation) — do
   * app/(site)/layout.tsx (Server Component) fetch qua
   * navigationApi.getByLocation("header") rồi truyền xuống làm giá trị KHỞI
   * TẠO (SSR, không nháy lần đầu). Header tự refetch lại 1 lần khi mount qua
   * useLiveNavigation để đồng bộ thay đổi Admin vừa lưu trong CÙNG session
   * (xem chú thích trong hook — SSR không đọc được localStorage của mock).
   * KHÔNG hard-code danh sách ở đây nữa. MobileHeaderMenu tái sử dụng chung
   * danh sách này (vị trí "mobile" tồn tại riêng trong mock cho tương lai
   * nếu mobile cần khác desktop, hiện tại Header vẫn dùng chung 1 nguồn).
   */
  navItems: NavigationItem[];
};

/* =================================================
 * HEADER
 * =============================================== */

export function Header({
  variant = "light",
  navItems: initialNavItems,
}: HeaderProps) {
  const liveNavItems = useLiveNavigation("header", initialNavItems);
  const navItems = liveNavItems.map((item) => ({ href: item.url ?? "#", label: item.label }));

  const [loginOpen, setLoginOpen] = useState(false);
  const { user: currentUser, login } = useAuth();

  const isScrolled = useScrollThreshold();

  const { cartCount } = useCart();
  const { registerCartTarget } = useFlyToCart();
  const { toggle: toggleMiniCart } = useMiniCart();

  const isDarkVariant = variant === "dark";

  /*
   * Dark variant:
   * - Top page    -> transparent + white
   * - Scrolled    -> cream + green
   *
   * Light variant:
   * - Luôn cream + green
   */
  const isTransparent =
    isDarkVariant && !isScrolled;

  const displayCart = cartCount > 0;

  /* =================================================
   * HANDLERS
   * =============================================== */

  function handleAuthenticated(user: AuthUser) {
    login(user);
    setLoginOpen(false);
  }

  /* =================================================
   * RENDER
   * =============================================== */

  return (
    <>
      <header
        className={`
          fixed
          left-0
          top-0
          z-50
          w-full

          transition-all
          duration-300

          ${
            isTransparent
              ? "bg-transparent text-white"
              : "bg-brand-cream text-brand-greenDark shadow-sm"
          }
        `}
      >
        <div
          className="
            mx-auto
            flex
            h-[64px]
            w-full
            max-w-[1200px]
            items-center
            justify-between
            px-5

            md:h-[68px]
            md:px-8

            xl:px-0
          "
        >
          {/* =================================================
           * LOGO
           * =============================================== */}

          <Link
            href="/"
            aria-label="Bánh Cuốn Tây Hồ 127"
            className="
              block
              w-[105px]
              shrink-0

              md:w-[118px]
            "
          >
            <Image
              src={
                isTransparent
                  ? "/images/logo-white.png"
                  : "/images/logo-color.png"
              }
              alt="Bánh Cuốn Tây Hồ 127"
              width={165}
              height={86}
              priority
              className="
                h-auto
                w-full
                object-contain
                transition-all
                duration-300
              "
            />
          </Link>

          {/* =================================================
           * DESKTOP NAVIGATION
           * =============================================== */}

          <nav
              aria-label="Điều hướng chính"
              className={`
                hidden
                items-center
                gap-10
                text-[15px]
                transition-all
                duration-300

                md:flex
                lg:gap-14

                ${
                  isTransparent
                    ? "font-extrabold text-white"
                    : "font-extrabold text-brand-greenDark"
                }
              `}
            >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  whitespace-nowrap
                  transition-opacity
                  duration-200

                  hover:opacity-70
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* =================================================
           * HEADER ACTIONS
           * =============================================== */}

          <div
            className="
              flex
              items-center
              gap-4
              text-[15px]
              font-black
              md:gap-5
            "
          >
            {/* Ngôn ngữ */}

            <LanguageSwitcher
              onChange={(language) => {
                console.log(
                  "Ngôn ngữ vừa chọn:",
                  language,
                );
              }}
            />

            {/* =================================================
             * GIỎ HÀNG (State 1: Header Cart — ẩn khi đã scroll,
             * FloatingCart bên dưới sẽ thay thế, xem State 2)
             * =============================================== */}

            <AnimatePresence initial={false}>
              {displayCart && !isScrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="hidden md:block"
                >
                  <CartTrigger
                    ref={(element) =>
                      registerCartTarget("desktop", element)
                    }
                    variant="header"
                    cartCount={cartCount}
                    showLabel
                    onClick={toggleMiniCart}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* =================================================
             * ĐĂNG NHẬP
             * =============================================== */}

            {currentUser ? (
              <Link
                href="/tai-khoan/don-hang"
                className="
                  hidden
                  items-center
                  gap-1.5
                  whitespace-nowrap

                  transition-opacity
                  duration-200

                  hover:opacity-70

                  md:inline-flex
                "
              >
                <UserRound className="size-[18px]" />
                <span>{currentUser.name}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setLoginOpen(true)
                }
                className="
                  hidden
                  items-center
                  gap-1.5
                  whitespace-nowrap

                  transition-opacity
                  duration-200

                  hover:opacity-70

                  md:inline-flex
                "
              >
                <UserRound className="size-[18px]" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* =================================================
             * MOBILE MENU
             * =============================================== */}

            <MobileHeaderMenu
              navItems={navItems}
              currentUser={currentUser}
              cartCount={cartCount}
              isDark={isTransparent}
              isScrolled={isScrolled}
              onLoginClick={() =>
                setLoginOpen(true)
              }
              onCartClick={toggleMiniCart}
            />
          </div>
        </div>
      </header>

      {/* State 2: Floating Cart — nổi lên khi đã scroll, thay Header Cart */}
      <FloatingCart />

      {/* Mini Cart dùng chung cho Header Cart + Floating Cart + Cart trong menu mobile */}
      <MiniCart />

      <AuthModal
        open={loginOpen}
        onClose={() =>
          setLoginOpen(false)
        }
        onAuthenticated={
          handleAuthenticated
        }
      />
    </>
  );
}