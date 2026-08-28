"use client";

import { useAdminLoginForm } from "../hooks/useAdminLoginForm";

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

  return (
    <div className="flex min-h-svh items-center justify-center bg-brand-cream px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] rounded-2xl border border-brand-line bg-white p-8 shadow-soft"
      >
        <h1 className="text-[20px] font-black text-brand-greenDark">
          Đăng nhập quản trị
        </h1>

        <p className="mt-1 text-[13px] text-brand-muted">
          Bánh Cuốn Tây Hồ 127 — khu vực dành cho quản trị viên.
        </p>

        <label className="mt-6 block text-[13px] font-bold text-brand-greenDark">
          Email

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            className="mt-1.5 h-11 w-full rounded-lg border border-brand-line px-4 text-[14px] font-medium text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
        </label>

        <label className="mt-4 block text-[13px] font-bold text-brand-greenDark">
          Mật khẩu

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="mt-1.5 h-11 w-full rounded-lg border border-brand-line px-4 text-[14px] font-medium text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 h-11 w-full rounded-lg bg-brand-red text-[14px] font-black text-white transition hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
