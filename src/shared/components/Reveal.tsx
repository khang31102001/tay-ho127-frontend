"use client";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <div style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}
