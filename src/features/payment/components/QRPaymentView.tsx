"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format-currency";
import type { PaymentSession } from "../types/payment.types";

type CopyableFieldProps = {
  label: string;
  value: string;
};

function CopyableField({ label, value }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Không thể sao chép:", error);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-[#0f9b55]/20 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#9a9a9a]">{label}</p>
        <p className="truncate text-[14px] font-black text-brand-greenDark">{value}</p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-md border border-brand-green px-3 py-1.5 text-[12px] font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
      >
        {copied ? "Đã sao chép" : "Sao chép"}
      </button>
    </div>
  );
}

type QRPaymentViewProps = {
  session: PaymentSession;
};

/** PaymentMethod === "QR" — quét mã QR minh họa hoặc chuyển khoản thủ công theo thông tin ngân hàng đã snapshot ở PaymentSession. */
export function QRPaymentView({ session }: QRPaymentViewProps) {
  return (
    <>
      <section className="rounded-lg bg-white p-7 shadow-soft">
        <h2 className="mb-4 text-[15px] font-black text-brand-greenDark">
          Cách 1 — Mở App ngân hàng / Ví quét mã QR
        </h2>

        <div className="mx-auto flex h-[180px] w-[180px] items-center justify-center rounded-lg border-2 border-dashed border-[#0f9b55]/40 bg-brand-cream/30 text-center text-[12px] text-[#9a9a9a]">
          Mã QR minh họa
        </div>
      </section>

      <section className="rounded-lg bg-white p-7 shadow-soft">
        <h2 className="mb-2 text-[15px] font-black text-brand-greenDark">Cách 2 — Chuyển khoản thủ công</h2>

        <div>
          {session.bankName && <CopyableField label="Ngân hàng" value={session.bankName} />}
          {session.bankAccountHolder && <CopyableField label="Thụ hưởng" value={session.bankAccountHolder} />}
          {session.bankAccountNumber && <CopyableField label="Số tài khoản" value={session.bankAccountNumber} />}
          <CopyableField label="Số tiền" value={formatCurrency(session.totalAmount)} />
          <CopyableField label="Nội dung chuyển khoản" value={`${session.referenceCode} ${session.phone}`} />
        </div>
      </section>
    </>
  );
}
