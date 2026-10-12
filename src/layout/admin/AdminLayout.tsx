"use client";

import React from "react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside>Admin Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
