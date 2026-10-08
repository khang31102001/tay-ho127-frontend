"use client";

import React from "react";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-layout">
      <header>Site Header</header>
      <main>{children}</main>
      <footer>Site Footer</footer>
    </div>
  );
}
