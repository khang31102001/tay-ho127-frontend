"use client";

import { useState } from "react";

import { DataEditor } from "@/components/admin/templates/DataEditor/DataEditor";
import { adminFieldInputClassName, adminFieldLabelClassName } from "@/components/admin/templates/formFieldClassName";
import { StatusPopup } from "@/components/shared/StatusPopup";

import { useOrderSettingsForm } from "../hooks/useOrderSettingsForm";
import { ORDER_CODE_DATE_FORMAT_OPTIONS, type OrderCodeDateFormat } from "../types/order-settings.types";

/**
 * Cấu hình chung của đơn hàng (singleton): cách sinh mã đơn + thời gian giữ chỗ phiên thanh toán QR/ví. Số thứ tự trong mã do
 * Backend cấp bằng bộ đếm trong cơ sở dữ liệu (không trùng khi nhiều đơn cùng lúc); chỗ này chỉ chọn hình dạng của mã.
 */
export function OrderSettingsForm() {
  const { form, exampleOrderCode, isLoading, updateField, handleSave } = useOrderSettingsForm();
  const [savedPopupOpen, setSavedPopupOpen] = useState(false);

  return (
    <>
      <DataEditor
        title="Cấu hình đơn hàng"
        backHref="/admin"
        onSave={handleSave}
        onSaved={() => setSavedPopupOpen(true)}
        isLoading={isLoading || !form}
        saveLabel="Lưu thay đổi"
      >
        {form && (
          <div className="space-y-4">
            <div className="rounded-lg border border-brand-line bg-brand-cream/30 p-4">
              <p className="text-[12px] font-bold uppercase tracking-wide text-brand-muted">Ví dụ mã đơn hiện tại</p>
              <p className="mt-1 text-[18px] font-black text-brand-greenDark">{exampleOrderCode}</p>
              <p className="mt-1 text-[12px] text-brand-muted">
                Thay đổi chỉ áp dụng cho đơn đặt sau khi lưu — mã của các đơn đã có không đổi.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={adminFieldLabelClassName}>
                Tiền tố mã đơn
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={form.orderCodePrefix}
                  onChange={(event) => updateField("orderCodePrefix", event.target.value)}
                  placeholder="TH127"
                  className={adminFieldInputClassName}
                />
                <span className="mt-1 block text-[12px] font-normal text-brand-muted">Chỉ chữ và số, tối đa 16 ký tự.</span>
              </label>

              <label className={adminFieldLabelClassName}>
                Độ dài số thứ tự
                <input
                  type="number"
                  required
                  min={3}
                  max={8}
                  value={form.orderCodeSequenceLength}
                  onChange={(event) => updateField("orderCodeSequenceLength", Number(event.target.value))}
                  className={adminFieldInputClassName}
                />
                <span className="mt-1 block text-[12px] font-normal text-brand-muted">Từ 3 đến 8 chữ số, đệm số 0 phía trước.</span>
              </label>
            </div>

            <label className={adminFieldLabelClassName}>
              Phần ngày trong mã đơn
              <select
                value={form.orderCodeDateFormat}
                onChange={(event) => updateField("orderCodeDateFormat", event.target.value as OrderCodeDateFormat)}
                className={adminFieldInputClassName}
              >
                {ORDER_CODE_DATE_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={adminFieldLabelClassName}>
              Thời gian giữ chỗ phiên thanh toán QR / ví (phút)
              <input
                type="number"
                required
                min={5}
                max={240}
                value={form.paymentSessionMinutes}
                onChange={(event) => updateField("paymentSessionMinutes", Number(event.target.value))}
                className={adminFieldInputClassName}
              />
              <span className="mt-1 block text-[12px] font-normal text-brand-muted">
                Quá thời gian này mà nhân viên chưa xác nhận đã nhận tiền thì phiên tự hủy (giỏ hàng của khách vẫn được giữ).
              </span>
            </label>
          </div>
        )}
      </DataEditor>

      <StatusPopup
        open={savedPopupOpen}
        onOpenChange={setSavedPopupOpen}
        status="success"
        title="Đã lưu cấu hình đơn hàng."
        description="Cấu hình mới áp dụng cho các đơn đặt từ bây giờ."
      />
    </>
  );
}
