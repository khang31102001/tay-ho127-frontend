
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Languages,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageDropdown } from "../common/language-dropdown";
import { useCart } from "@/contexts/cart-context";
import { LanguageSwitcher } from "../common/language-switcher";
import { AuthUser } from "@/types/auth";
import LoginModal from "../auth/LoginModal";

type HeaderProps = {
  variant?: "dark" | "light";
};

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/menu", label: "Thực đơn" }
];

export function Header({ variant = "light" }: HeaderProps) {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  function handleAuthenticated(user: AuthUser) {
    setCurrentUser(user);
    setLoginOpen(false);
  }

  const { cartCount } = useCart();

  const isDark = variant === "dark";
  const displayCart = cartCount > 0;

  return (
    <header className={`sticky left-0 top-0 z-50 w-full transition-all duration-300 ${isDark
      ? "bg-transparent text-white"
      : "bg-brand-cream shadow-sm"
      }`}>
      <div className="mx-auto flex h-[86px] w-full max-w-[880px] items-center justify-between px-5 md:px-0">
        <Link href="/" className="block w-[150px] md:w-[165px]" aria-label="Bánh Cuốn Tây Hồ 127">
          <Image src={isDark ? "/images/logo-white.png" : "/images/logo-color.png"} alt="Tây Hồ 127" width={165} height={86} className="h-auto w-full" />
        </Link>

        <nav className="hidden items-center gap-16 text-[16px] font-black md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={isDark ? "text-white" : "text-tayho-greenDark"}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          className={`flex items-center gap-5 text-[16px] font-bold ${isDark ? "text-white" : "text-tayho-greenDark"
            }`}
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

          {/* Giỏ hàng */}
          <button
            onClick={() => router.push("/checkout")}
            type="button"
            className={`group  items-center gap-2 transition-opacity hover:opacity-70 ${displayCart ? "md:inline-flex" : "hidden"}`}
            aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
          >
            <span className="relative">
              <ShoppingCart className="size-5" />

              {cartCount > 0 && (
                <span className="absolute -right-2.5 -top-2.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>

            <span className="hidden sm:inline">Giỏ hàng</span>
          </button>

          {/* Đăng nhập */}
          <button
            onClick={() => setLoginOpen(true)}
            type="button"
            className="hidden items-center gap-2 transition-opacity hover:opacity-70 md:inline-flex"
          >
            <UserRound className="size-4" />
            {currentUser ? currentUser.name : "Đăng nhập"}

          </button>
        </div>
      </div>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </header>
  );
}
