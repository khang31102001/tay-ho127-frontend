"use client";

import Link from "next/link";
import { MapPin, ShoppingBag } from "lucide-react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import {
  adminFieldInputClassName,
  adminFieldLabelClassName,
} from "@/components/admin/templates/formFieldClassName";
import { MediaPicker } from "@/components/shared/MediaPicker";
import type { EntityStatus } from "@/components/admin/templates/StatusBadge";

import { useCustomerEditor } from "../hooks/useCustomerEditor";
import { GENDER_OPTIONS, type Gender } from "../types/customer.types";

type CustomerEditorProps = {
  id?: string;
};

export function CustomerEditor({ id }: CustomerEditorProps) {
  const {
    form,
    updateField,
    customerCode,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  } = useCustomerEditor({ id });

  return (
    <DataEditor
      title={isEditMode ? "Sửa khách hàng" : "Thêm khách hàng"}
      backHref="/admin/sales/customers"
      isLoading={isLoading}
      onSave={handleSave}
      onSaved={goToExplore}
      onDelete={isEditMode ? handleDelete : undefined}
      onDeleted={goToExplore}
    >
      {customerCode && (
        <p className="text-[13px] text-brand-muted">
          Mã khách hàng: <span className="font-bold text-brand-ink">{customerCode}</span>
        </p>
      )}

      <label className={adminFieldLabelClassName}>
        Họ tên
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className={adminFieldInputClassName}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Số điện thoại
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Email (tùy chọn)
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(event) => updateField("email", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminFieldLabelClassName}>
          Ngày sinh (tùy chọn)
          <input
            type="date"
            value={form.dateOfBirth ?? ""}
            onChange={(event) => updateField("dateOfBirth", event.target.value)}
            className={adminFieldInputClassName}
          />
        </label>

        <label className={adminFieldLabelClassName}>
          Giới tính (tùy chọn)
          <select
            value={form.gender ?? ""}
            onChange={(event) =>
              updateField("gender", event.target.value === "" ? undefined : (event.target.value as Gender))
            }
            className={adminFieldInputClassName}
          >
            <option value="">Không chọn</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MediaPicker
        label="Ảnh đại diện (tùy chọn)"
        mediaOptions={mediaOptions}
        selectedId={form.avatarMediaId ?? null}
        onChange={(mediaId) => updateField("avatarMediaId", mediaId)}
      />

      <label className={adminFieldLabelClassName}>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) => updateField("status", event.target.value as EntityStatus)}
          className={adminFieldInputClassName}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </label>

      {isEditMode && id && (
        <div className="flex flex-col gap-3 border-t border-brand-line pt-5">
          <Link
            href={`/admin/sales/customers/${id}/addresses`}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-green transition hover:underline"
          >
            <MapPin className="size-4" />
            Quản lý địa chỉ
          </Link>

          <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-brand-line bg-brand-cream/30 px-4 py-3 text-[13px] text-brand-muted">
            <ShoppingBag className="mt-0.5 size-4 shrink-0" />
            <span>
              Lịch sử đơn hàng &amp; thống kê chi tiêu sẽ hiển thị ở đây sau khi triển khai Order
              Management (Phase 03) — số liệu này tính động từ Order, không lưu cứng trên hồ sơ
              khách hàng.
            </span>
          </div>
        </div>
      )}
    </DataEditor>
  );
}
