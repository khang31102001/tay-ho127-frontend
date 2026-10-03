"use client";

import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { useAdminAuth } from "@/features/admin-auth";

import { usePaymentSessionsPanel } from "../hooks/usePaymentSessionsPanel";

/**
 * Phiên thanh toán QR/ví đang CHỜ NHÂN VIÊN xác nhận: khách đã chuyển khoản theo mã tham chiếu nhưng đơn hàng CHƯA được tạo.
 * Nhân viên đối chiếu số tiền + mã tham chiếu trong sao kê ngân hàng rồi bấm "Đã nhận tiền" (Backend tạo đơn, thanh toán "đã
 * thanh toán") hoặc "Không thấy tiền" (khách nhìn thấy lý do và có thể thử lại). Cần quyền payments.manage để thao tác.
 */
export function PaymentSessionsPanel() {
  const { hasPermission } = useAdminAuth();
  const canManage = hasPermission("payments.manage");
  const { sessions, isLoading, busySessionId, notice, handleConfirm, handleReject } = usePaymentSessionsPanel();

  function askRejectNote(sessionId: string): string | null {
    const session = sessions.find((candidate) => candidate.id === sessionId);
    if (!session) return null;
    return window.prompt(`Lý do khách nhìn thấy (để trống = "Chưa nhận được tiền chuyển khoản") — phiên ${session.referenceCode}:`, "");
  }

  return (
    <section className="mb-6 rounded-lg border border-brand-line bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-black text-brand-greenDark">Phiên thanh toán chờ xác nhận</h2>
          <p className="mt-1 text-[12px] text-brand-muted">
            Khách chuyển khoản/ví nhưng đơn hàng chưa được tạo. Chỉ xác nhận khi đã thấy tiền về đúng số tiền và mã tham chiếu.
          </p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-[12px] font-bold text-orange-700">
          {isLoading ? "…" : `${sessions.length} chờ`}
        </span>
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-3 rounded-lg px-3 py-2 text-[13px] font-bold ${
            notice.tone === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {notice.message}
        </p>
      )}

      {!isLoading && sessions.length === 0 ? (
        <p className="mt-4 text-[13px] text-brand-muted">Không có phiên nào đang chờ.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-brand-line text-[11px] uppercase tracking-wide text-brand-muted">
                <th className="py-2 pr-3">Mã tham chiếu</th>
                <th className="py-2 pr-3">Khách hàng</th>
                <th className="py-2 pr-3">Phương thức</th>
                <th className="py-2 pr-3 text-right">Số tiền</th>
                <th className="py-2 pr-3">Hết hạn</th>
                {canManage && <th className="py-2 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const isBusy = busySessionId === session.id;
                return (
                  <tr key={session.id} className="border-b border-brand-line last:border-b-0">
                    <td className="py-3 pr-3 font-black text-brand-greenDark">{session.referenceCode}</td>
                    <td className="py-3 pr-3">
                      {session.customerName}
                      <span className="block text-[12px] text-brand-muted">{session.phone}</span>
                    </td>
                    <td className="py-3 pr-3">{session.paymentMethodLabel}</td>
                    <td className="py-3 pr-3 text-right font-bold">
                      <MoneyDisplay value={session.totalAmount} />
                    </td>
                    <td className="py-3 pr-3">{new Date(session.expiresAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</td>
                    {canManage && (
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleConfirm(session)}
                            className="rounded-lg bg-brand-red px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? "Đang xử lý..." : "Đã nhận tiền"}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => {
                              const note = askRejectNote(session.id);
                              if (note !== null) void handleReject(session, note);
                            }}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-[12px] font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Không thấy tiền
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
