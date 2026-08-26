"use client";

import type { AuthUser } from "@/types/auth";
import styles from "./AuthModal.module.css";
import { useAuthModal, type AuthMode } from "./useAuthModal";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

const MODE_CONTENT: Record<AuthMode, { title: string; description: string }> = {
  login: {
    title: "Đăng nhập",
    description: "Đăng nhập để tiếp tục đặt món.",
  },
  register: {
    title: "Đăng ký tài khoản",
    description: "Tạo tài khoản để lưu thông tin và đặt món nhanh hơn.",
  },
  "forgot-password": {
    title: "Quên mật khẩu",
    description: "Nhập số điện thoại để lấy lại mật khẩu.",
  },
};

export default function AuthModal({
  open,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const {
    mode,
    switchMode,
    isLoading,

    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLoginSubmit,
    handleGoogleLogin,

    registerFullName,
    setRegisterFullName,
    registerPhone,
    setRegisterPhone,
    registerPassword,
    setRegisterPassword,
    registerConfirmPassword,
    setRegisterConfirmPassword,
    registerError,
    registerSuccess,
    registerLoading,
    handleRegisterSubmit,

    forgotPhone,
    setForgotPhone,
    forgotError,
    forgotSuccess,
    forgotLoading,
    handleForgotSubmit,
  } = useAuthModal({ open, onClose, onAuthenticated });

  if (!open) return null;

  const { title, description } = MODE_CONTENT[mode];

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Đóng cửa sổ xác thực"
          onClick={onClose}
          disabled={isLoading}
        >
          ×
        </button>

        <header className={styles.header}>
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>
        </header>

        {mode === "login" ? (
          <>
            <form className={styles.form} onSubmit={handleLoginSubmit}>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </label>

              <label className={styles.field}>
                <span>Mật khẩu</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </label>

              <button
                type="button"
                className={styles.inlineLink}
                onClick={() => switchMode("forgot-password")}
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>

              {error ? <p className={styles.error}>{error}</p> : null}

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {loading === "credentials" ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div className={styles.divider}>
              <span>hoặc</span>
            </div>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <span className={styles.googleIcon} aria-hidden="true">
                G
              </span>
              {loading === "google" ? "Đang kết nối Google..." : "Tiếp tục với Google"}
            </button>

            <p className={styles.footerText}>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                className={styles.footerLink}
                onClick={() => switchMode("register")}
                disabled={isLoading}
              >
                Đăng ký
              </button>
            </p>

            <div className={styles.demoBox}>
              <strong>Tài khoản test</strong>
              <span>Email: demo@tayho127.vn</span>
              <span>Mật khẩu: 123456</span>
            </div>
          </>
        ) : null}

        {mode === "register" ? (
          <>
            <form className={styles.form} onSubmit={handleRegisterSubmit}>
              <label className={styles.field}>
                <span>Họ và tên</span>
                <input
                  type="text"
                  value={registerFullName}
                  onChange={(event) => setRegisterFullName(event.target.value)}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  required
                  disabled={registerLoading}
                />
              </label>

              <label className={styles.field}>
                <span>Số điện thoại</span>
                <input
                  type="tel"
                  value={registerPhone}
                  onChange={(event) => setRegisterPhone(event.target.value)}
                  placeholder="09xx xxx xxx"
                  autoComplete="tel"
                  required
                  disabled={registerLoading}
                />
              </label>

              <label className={styles.field}>
                <span>Mật khẩu</span>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="new-password"
                  required
                  disabled={registerLoading}
                />
              </label>

              <label className={styles.field}>
                <span>Xác nhận mật khẩu</span>
                <input
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  required
                  disabled={registerLoading}
                />
              </label>

              {registerError ? <p className={styles.error}>{registerError}</p> : null}
              {registerSuccess ? (
                <p className={styles.success}>{registerSuccess}</p>
              ) : null}

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={registerLoading}
              >
                {registerLoading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>

            <p className={styles.footerText}>
              Đã có tài khoản?{" "}
              <button
                type="button"
                className={styles.footerLink}
                onClick={() => switchMode("login")}
                disabled={registerLoading}
              >
                Đăng nhập
              </button>
            </p>
          </>
        ) : null}

        {mode === "forgot-password" ? (
          <>
            <form className={styles.form} onSubmit={handleForgotSubmit}>
              <label className={styles.field}>
                <span>Số điện thoại</span>
                <input
                  type="tel"
                  value={forgotPhone}
                  onChange={(event) => setForgotPhone(event.target.value)}
                  placeholder="09xx xxx xxx"
                  autoComplete="tel"
                  required
                  disabled={forgotLoading}
                />
              </label>

              {forgotError ? <p className={styles.error}>{forgotError}</p> : null}
              {forgotSuccess ? <p className={styles.success}>{forgotSuccess}</p> : null}

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </form>

            <p className={styles.footerText}>
              <button
                type="button"
                className={styles.footerLink}
                onClick={() => switchMode("login")}
                disabled={forgotLoading}
              >
                Quay lại đăng nhập
              </button>
            </p>
          </>
        ) : null}
      </section>
    </div>
  );
}
