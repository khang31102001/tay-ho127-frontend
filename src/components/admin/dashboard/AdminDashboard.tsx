"use client";

import Link from "next/link";
import { ShieldCheck, UtensilsCrossed, Users } from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth";

import { useAdminDashboard } from "./useAdminDashboard";

const STAT_CARDS = [
  {
    key: "productCount" as const,
    label: "Món ăn trong thực đơn",
    href: "/admin/catalog/products",
    icon: UtensilsCrossed,
  },
  {
    key: "userCount" as const,
    label: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    key: "roleCount" as const,
    label: "Vai trò",
    href: "/admin/roles",
    icon: ShieldCheck,
  },
];

export function AdminDashboard() {
  const { user } = useAdminAuth();
  const { stats, isLoading } = useAdminDashboard();

  return (
    <div>
      <h1 className="text-[20px] font-black text-brand-greenDark">
        Chào {user?.name ?? "Quản trị viên"}
      </h1>

      <p className="mt-1 text-[14px] text-brand-muted">
        Tổng quan hệ thống Bánh Cuốn Tây Hồ 127.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.key}
              href={card.href}
              className="flex items-center gap-4 rounded-lg border border-brand-line bg-white p-5 transition hover:border-brand-green"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-greenDark">
                <Icon className="size-5" />
              </span>

              <span>
                <span className="block text-[24px] font-black text-brand-greenDark">
                  {isLoading || !stats ? "—" : stats[card.key]}
                </span>

                <span className="block text-[13px] font-medium text-brand-muted">
                  {card.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
