"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "../context/admin-auth-context";
import { loginAdmin } from "../services/admin-auth.service";

export function useAdminLoginForm() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      login(await loginAdmin({ email, password }));
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
