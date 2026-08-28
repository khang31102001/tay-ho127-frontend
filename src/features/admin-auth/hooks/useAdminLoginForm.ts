"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "../context/admin-auth-context";
import { loginAdmin } from "../services/admin-auth.service";

export function useAdminLoginForm() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("admin@tayho127.vn");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginAdmin({ email, password });
      login(result.data.user);
      router.push("/admin");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Đăng nhập thất bại.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  };
}
