"use client";

import Link from "next/link";

import { useSeoDashboard } from "../hooks/useSeoDashboard";

type StatCardProps = {
  label: string;
  value: number;
  tone?: "default" | "warning";
};

function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-brand-line bg-white p-4">
      <p className="text-[12.5px] font-bold text-brand-muted">{label}</p>
      <p className={`mt-1 text-[26px] font-black ${tone === "warning" ? "text-amber-600" : "text-brand-greenDark"}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * Task 11 — SEO Dashboard. Không có thẻ "Schema đang sử dụng" vì module
 * Schema.org/JSON-LD chưa triển khai ở phạm vi lần này (xem ghi chú trong
 * useSeoDashboard.ts).
 */
export function SeoDashboard() {
  const { stats, isLoading } = useSeoDashboard();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black text-brand-greenDark">SEO Dashboard</h1>

        <Link
          href="/admin/seo/settings"
          className="text-[13px] font-bold text-brand-muted transition hover:text-brand-greenDark"
        >
          Cài đặt SEO chung →
        </Link>
      </div>

      {isLoading || !stats ? (
        <div className="mt-4 rounded-lg border border-brand-line bg-white p-6 text-center text-brand-muted">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Tổng số trang/entity" value={stats.totalEntities} />
            <StatCard label="Đã cấu hình SEO riêng" value={stats.withOverride} />
            <StatCard label="Đang Noindex" value={stats.noindexCount} tone={stats.noindexCount > 0 ? "warning" : "default"} />
            <StatCard
              label="Thiếu Meta Title"
              value={stats.missingMetaTitle}
              tone={stats.missingMetaTitle > 0 ? "warning" : "default"}
            />
            <StatCard
              label="Thiếu Meta Description"
              value={stats.missingMetaDescription}
              tone={stats.missingMetaDescription > 0 ? "warning" : "default"}
            />
            <StatCard
              label="Thiếu OG Image"
              value={stats.missingOgImage}
              tone={stats.missingOgImage > 0 ? "warning" : "default"}
            />
          </div>

          <div className="mt-6">
            <Link
              href="/admin/seo/metadata"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2.5 text-[14px] font-bold text-white transition hover:bg-brand-redDark"
            >
              Xem danh sách SEO Metadata
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
