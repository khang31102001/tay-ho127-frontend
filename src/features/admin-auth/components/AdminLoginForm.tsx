"use client";

import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

import { site } from "@/core/config/site-data";

import { useAdminLoginForm } from "../hooks/useAdminLoginForm";

/** Ảnh mâm bánh cuốn thật làm nền — dùng chung ảnh với section Trải nghiệm ở trang chủ. */
const LOGIN_BACKGROUND_SRC = "/images/active-img-1.png";

const inputClassName =
  "h-12 w-full rounded-admin border border-admin-border bg-admin-surface px-4 text-admin-base text-admin-text outline-none transition-colors duration-admin focus:border-admin-focus focus:ring-2 focus:ring-admin-focus/30";

const labelClassName = "block text-admin-base font-medium text-admin-text";

export function AdminLoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  } = useAdminLoginForm();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const emailInputId = useId();
  const passwordInputId = useId();

  return (
    <main className="relative flex min-h-svh items-center justify-center gap-10 overflow-hidden px-4 py-10 lg:justify-between lg:px-[6vw]">
      <Image
        src={LOGIN_BACKGROUND_SRC}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Lớp phủ xanh Admin → vàng gỗ Tây Hồ: chữ trắng bên trái đủ tương phản, ảnh món vẫn còn thấy. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-admin-primary/90 via-admin-primary/60 to-admin-overlayWarm/80"
      />

      <section className="relative hidden max-w-[480px] border-l-4 border-admin-accent pl-5 text-white lg:block">
        <h1 className="font-display text-[48px] uppercase leading-none tracking-wide xl:text-[56px]">
          Tây Hồ 127 Admin
        </h1>
        <p className="mt-3 text-admin-lg text-white/85">
          Quản lý thực đơn, đơn hàng và khách hàng tại một nơi
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[440px] rounded-2xl bg-admin-surface px-6 py-10 shadow-2xl sm:px-10"
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src={site.assets.logoColor}
            alt={site.name}
            width={180}
            height={80}
            priority
            className="h-auto w-[180px]"
          />
          <p className="mt-2 text-admin-xs font-bold uppercase tracking-[0.14em] text-admin-accent">
            Hương vị Bắc giữa lòng Sài Gòn
          </p>
          {/* Tiêu đề cho trình đọc màn hình khi khối chữ bên trái bị ẩn (dưới lg). */}
          <h2 className="sr-only lg:hidden">Đăng nhập Tây Hồ 127 Admin</h2>
        </div>

        <div className="mt-8">
          <label htmlFor={emailInputId} className={labelClassName}>
            Email
          </label>
          <input
            id={emailInputId}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            className={`${inputClassName} mt-2`}
          />
        </div>

        <div className="mt-5">
          <label htmlFor={passwordInputId} className={labelClassName}>
            Mật khẩu
          </label>
          <div className="relative mt-2">
            <input
              id={passwordInputId}
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className={`${inputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
              aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={isPasswordVisible}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-admin text-admin-textSecondary outline-none transition-colors duration-admin hover:text-admin-text focus-visible:ring-2 focus-visible:ring-admin-focus/50"
            >
              {isPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-admin border border-admin-danger/40 bg-admin-danger/10 px-4 py-2.5 text-admin-sm font-medium text-admin-dangerText"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 h-12 w-full rounded-admin bg-admin-primary text-admin-lg font-semibold text-white outline-none transition-colors duration-admin hover:bg-admin-primaryHover focus-visible:ring-2 focus-visible:ring-admin-focus/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
