"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/contexts/cart-context";
import { useFlyToCart } from "@/contexts/fly-to-cart-context";
import { useScrollThreshold } from "@/hooks/useScrollThreshold";
import { AuthUser } from "@/types/auth";

import { LanguageSwitcher } from "../common/LanguageSwitcher";
import AuthModal from "../auth/AuthModal";
import MobileHeaderMenu from "./MobileHeaderMenu";

/* =================================================
 * TYPES
 * =============================================== */

type HeaderProps = {
  variant?: "dark" | "light";
};

/* =================================================
 * CONSTANTS
 * =============================================== */

const navItems = [
  {
    href: "/",
    label: "Trang chủ",
  },
  {
    href: "/menu",
    label: "Thực đơn",
  },
];

/* =================================================
 * HEADER
 * =============================================== */

export function Header({
  variant = "light",
}: HeaderProps) {
  const router = useRouter();

  const [loginOpen, setLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(null);

  const isScrolled = useScrollThreshold();

  const { cartCount } = useCart();
  const { registerCartTarget } = useFlyToCart();

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
    setCurrentUser(user);
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
                    ? "font-bold text-white"
                    : "font-bold text-brand-greenDark"
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
              font-bold
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
             * GIỎ HÀNG
             * =============================================== */}

            <button
              data-cart-target
              ref={(element) =>
                registerCartTarget("desktop", element)
              }
              type="button"
              aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
              onClick={() =>
                router.push("/checkout")
              }
              className={`
                group
                hidden
                items-center
                gap-1.5
                whitespace-nowrap

                transition-opacity
                duration-200

                hover:opacity-70

                ${
                  displayCart
                    ? "md:inline-flex"
                    : ""
                }
              `}
            >
              <span className="relative">
                <ShoppingCart className="size-[18px]" />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-2.5
                      -top-2.5

                      flex
                      min-h-[18px]
                      min-w-[18px]
                      items-center
                      justify-center

                      rounded-full
                      bg-orange-500
                      px-1

                      text-[10px]
                      font-bold
                      leading-none
                      text-white
                    "
                  >
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </span>
                )}
              </span>

              <span>Giỏ hàng</span>
            </button>

            {/* =================================================
             * ĐĂNG NHẬP
             * =============================================== */}

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

              <span>
                {currentUser
                  ? currentUser.name
                  : "Đăng nhập"}
              </span>
            </button>

            {/* =================================================
             * MOBILE MENU
             * =============================================== */}

            <MobileHeaderMenu
              navItems={navItems}
              currentUser={currentUser}
              cartCount={cartCount}
              isDark={isTransparent}
              onLoginClick={() =>
                setLoginOpen(true)
              }
              onCartClick={() =>
                router.push("/checkout")
              }
            />
          </div>
        </div>
      </header>

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