"use client";

export function Modal({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  return isOpen ? <div role="dialog">{children}</div> : null;
}
