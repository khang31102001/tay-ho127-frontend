"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  forgotPassword,
  loginWithCredentials,
  requestRegistrationOtp,
  verifyRegistration,
} from "../services/auth.service";
import type { AuthUser } from "../types/auth.types";

/**
 * Đăng nhập Google chưa được cấu hình ở Backend (cần GoogleAuth:ClientId) — nút vẫn hiển thị nhưng báo rõ thay vì giả vờ
 * đăng nhập. Khi bật Google, thay hàm xử lý bên dưới bằng lời gọi POST /api/v1/customer/auth/google với idToken của Google.
 */
const GOOGLE_NOT_AVAILABLE_MESSAGE = "Đăng nhập bằng Google chưa khả dụng. Vui lòng đăng nhập bằng email.";

export type AuthMode = "login" | "register" | "forgot-password";

/** Đăng ký gồm 2 bước: điền form → nhập mã OTP nhận qua Zalo/SMS. */
export type RegisterStep = "form" | "otp";

const OTP_MIN_LENGTH = 4;

type UseAuthModalParams = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

export function useAuthModal({ open, onClose, onAuthenticated }: UseAuthModalParams) {
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"credentials" | null>(null);

  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  /** Mốc (ms) từ đó được gửi lại mã; null khi chưa gửi mã nào. */
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  /** Mã phiên OTP do Backend cấp ở bước 1 — phải gửi lại cùng mã khách nhập ở bước 2. */
  const [otpChallengeId, setOtpChallengeId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const isLoading = loading !== null || registerLoading || otpLoading || forgotLoading;
  const resendSecondsLeft = resendAvailableAt === null ? 0 : Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));

  // Đếm ngược "Gửi lại mã" — chỉ chạy khi đang ở bước nhập mã và còn phải chờ.
  useEffect(() => {
    if (registerStep !== "otp" || resendSecondsLeft <= 0) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [registerStep, resendSecondsLeft]);

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
      resetOtpStep();
      setForgotError("");
      setForgotSuccess("");
    }
  }, [open]);

  function resetOtpStep() {
    setRegisterStep("form");
    setOtpCode("");
    setOtpError("");
    setResendAvailableAt(null);
    setOtpChallengeId(null);
  }

  function switchMode(nextMode: AuthMode) {
    setError("");
    setRegisterError("");
    setRegisterSuccess("");
    resetOtpStep();
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

  function handleGoogleLogin() {
    setError(GOOGLE_NOT_AVAILABLE_MESSAGE);
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
      const result = await sendRegistrationOtp();

      if (!result.data.verificationRequired) {
        // Backend không bật xác minh số điện thoại: không có mã để nhập, tạo tài khoản luôn.
        const created = await verifyRegistration(registrationFormData());
        onAuthenticated(created.data.user);
        return;
      }

      setOtpCode("");
      setOtpError("");
      setRegisterStep("otp");
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Không gửi được mã xác minh.");
    } finally {
      setRegisterLoading(false);
    }
  }

  /** Dữ liệu form đăng ký — Backend không giữ lại giữa hai bước nên bước 2 gửi lại nguyên vẹn. */
  function registrationFormData() {
    return {
      fullName: registerFullName,
      phone: registerPhone,
      email: registerEmail,
      password: registerPassword,
    };
  }

  /** Gửi (hoặc gửi lại) mã OTP với thông tin đã điền ở form đăng ký; mỗi lần gửi Backend cấp một `challengeId` mới. */
  async function sendRegistrationOtp() {
    const result = await requestRegistrationOtp({
      ...registrationFormData(),
      confirmPassword: registerConfirmPassword,
    });

    if (result.data.verificationRequired) {
      setNow(Date.now());
      setResendAvailableAt(new Date(result.data.resendAvailableAt).getTime());
      setOtpChallengeId(result.data.challengeId);
    }
    return result;
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOtpError("");

    const code = otpCode.replace(/\s/g, "");
    if (code.length < OTP_MIN_LENGTH) {
      setOtpError("Vui lòng nhập mã xác minh.");
      return;
    }

    if (!otpChallengeId) {
      setOtpError("Phiên xác minh đã hết hiệu lực. Vui lòng gửi lại mã mới.");
      return;
    }

    setOtpLoading(true);

    try {
      const result = await verifyRegistration({ ...registrationFormData(), challengeId: otpChallengeId, code });
      // Mã đúng → tài khoản đã được tạo và đăng nhập (cookie phiên được máy chủ ghi).
      onAuthenticated(result.data.user);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Xác minh thất bại.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendSecondsLeft > 0 || otpLoading) return;

    setOtpError("");
    setOtpLoading(true);

    try {
      await sendRegistrationOtp();
      setOtpCode("");
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Không gửi được mã xác minh.");
    } finally {
      setOtpLoading(false);
    }
  }

  /** Quay lại form đăng ký để sửa số điện thoại/thông tin; mã đã gửi bỏ dùng. */
  function handleBackToRegisterForm() {
    resetOtpStep();
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
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    registerConfirmPassword,
    setRegisterConfirmPassword,
    registerError,
    registerSuccess,
    registerLoading,
    handleRegisterSubmit,

    registerStep,
    otpCode,
    setOtpCode,
    otpError,
    otpLoading,
    resendSecondsLeft,
    handleOtpSubmit,
    handleResendOtp,
    handleBackToRegisterForm,

    forgotPhone,
    setForgotPhone,
    forgotError,
    forgotSuccess,
    forgotLoading,
    handleForgotSubmit,
  };
}
