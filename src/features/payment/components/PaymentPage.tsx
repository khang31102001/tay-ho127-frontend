"use client";

import Link from "next/link";

import MenuBackgroundDecoration from "@/components/ui/MenuBackgroundDecoration";
import { usePaymentPage } from "../hooks/usePaymentPage";
import { PaymentSummary } from "./PaymentSummary";
import { QRPaymentView } from "./QRPaymentView";
import { DigitalWalletPaymentView } from "./DigitalWalletPaymentView";
import { PaymentStatusPanel } from "./PaymentStatusPanel";

type PaymentPageProps = {
  sessionId: string;
};

/**
 * /payment/[sessionId] — dùng CHUNG cho PHƯƠNG THỨC QR và DIGITAL_WALLET
 * (Apple Pay/Google Pay/...), render theo session.paymentMethod, không tách
 * page riêng cho từng provider (xem QRPaymentView/DigitalWalletPaymentView).
 * Order/Payment thật CHƯA tồn tại ở trang này — chỉ có PaymentSession (xem
 * features/payment/services/payment-session.service.ts). Khách xác nhận
 * thanh toán thành công mới thật sự tạo Order (điều hướng sang
 * /don-hang/[orderCode] — trang Order Success/Tracking sẵn có, không tạo
 * trang mới).
 */
export function PaymentPage({ sessionId }: PaymentPageProps) {
  const { session, isProcessing, actionError, handleConfirmPayment, handleReportFailure, handleRetry, handleCancel } =
    usePaymentPage(sessionId);

  return (
    <div className="relative isolate w-full min-h-screen bg-[#ff9418] px-5 py-28 md:px-0">
      <MenuBackgroundDecoration leftColor="#F5C884" rightColor="#F5C884" />

      <div className="mx-auto max-w-[560px] space-y-3">
        {session === undefined ? (
          <section className="rounded-lg bg-white p-10 text-center text-[15px] text-[#4b4b4b] shadow-soft">
            Đang tải thông tin thanh toán...
          </section>
        ) : session === null ? (
          <section className="rounded-lg bg-white p-10 text-center shadow-soft">
            <p className="text-[15px] text-[#4b4b4b]">Không tìm thấy phiên thanh toán.</p>
            <Link href="/gio-hang" className="mt-4 inline-block font-bold text-brand-green hover:underline">
              ← Quay lại giỏ hàng
            </Link>
          </section>
        ) : session.status === "cancelled" ? (
          <section className="rounded-lg border border-red-300 bg-red-50 p-7 text-center shadow-soft">
            <p className="text-[15px] font-black text-red-600">Phiên thanh toán đã hết hạn hoặc đã bị hủy</p>
            <p className="mt-1 text-[13px] text-red-500">Vui lòng quay lại giỏ hàng để đặt lại đơn hàng.</p>
            <Link
              href="/gio-hang"
              className="mt-4 inline-block rounded-md bg-brand-red px-8 py-3 text-[14px] font-black text-white transition hover:opacity-90"
            >
              Quay lại giỏ hàng
            </Link>
          </section>
        ) : (
          <>
            <PaymentSummary session={session} />

            {session.paymentMethod === "QR" && <QRPaymentView session={session} />}
            {session.paymentMethod === "DIGITAL_WALLET" && <DigitalWalletPaymentView session={session} />}

            <PaymentStatusPanel
              session={session}
              isProcessing={isProcessing}
              actionError={actionError}
              onConfirm={handleConfirmPayment}
              onReportFailure={handleReportFailure}
              onRetry={handleRetry}
            />

            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isProcessing || session.status === "processing"}
                className="text-[13px] font-bold text-white underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy và quay lại giỏ hàng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
