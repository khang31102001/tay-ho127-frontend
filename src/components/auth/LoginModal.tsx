"use client";

import { FormEvent, useEffect, useState } from "react";
import { loginWithCredentials, loginWithGoogle } from "@/services/auth-service";
import type { AuthUser } from "@/types/auth"
import styles from "./LoginModal.module.css";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

export default function LoginModal({
  open,
  onClose,
  onAuthenticated,
}: LoginModalProps) {
  const [email, setEmail] = useState("demo@tayho127.vn");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"credentials" | "google" | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading("credentials");

    try {
      const result = await loginWithCredentials({ email, password });
      onAuthenticated(result.data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading("google");

    try {
      const result = await loginWithGoogle();
      onAuthenticated(result.data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng nhập Google thất bại.");
    } finally {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;

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
        aria-labelledby="login-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Đóng cửa sổ đăng nhập"
          onClick={onClose}
          disabled={isLoading}
        >
          ×
        </button>

        <header className={styles.header}>
          <h1 id="login-title">Đăng nhập</h1>
          <p>Đăng nhập để tiếp tục đặt món.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
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

        <div className={styles.demoBox}>
          <strong>Tài khoản test</strong>
          <span>Email: demo@tayho127.vn</span>
          <span>Mật khẩu: 123456</span>
        </div>
      </section>
    </div>
  );
}
