"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  forgotPassword,
  loginWithCredentials,
  loginWithGoogle,
  registerAccount,
} from "../services/auth.service";
import type { AuthUser } from "../types/auth.types";

export type AuthMode = "login" | "register" | "forgot-password";

type UseAuthModalParams = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

export function useAuthModal({ open, onClose, onAuthenticated }: UseAuthModalParams) {
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("demo@tayho127.vn");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"credentials" | "google" | null>(null);

  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const isLoading = loading !== null || registerLoading || forgotLoading;

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, isLoading, onClose]);

  useEffect(() => {
    if (!open) {
      setMode("login");
      setError("");
      setRegisterError("");
      setRegisterSuccess("");
      setForgotError("");
      setForgotSuccess("");
    }
  }, [open]);

  function switchMode(nextMode: AuthMode) {
    setError("");
    setRegisterError("");
    setRegisterSuccess("");
    setForgotError("");
    setForgotSuccess("");
    setMode(nextMode);
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
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

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Xác nhận mật khẩu không khớp.");
      return;
    }

    setRegisterLoading(true);

    try {
      const result = await registerAccount({
        fullName: registerFullName,
        phone: registerPhone,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
      });
      setRegisterSuccess(result.message);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Đăng ký thất bại.");
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);

    try {
      const result = await forgotPassword({ phone: forgotPhone });
      setForgotSuccess(result.message);
    } catch (error) {
      setForgotError(error instanceof Error ? error.message : "Gửi yêu cầu thất bại.");
    } finally {
      setForgotLoading(false);
    }
  }

  return {
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
  };
}
