"use client";

export function StatusPopup({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  return <div role="alert">{message}</div>;
}
