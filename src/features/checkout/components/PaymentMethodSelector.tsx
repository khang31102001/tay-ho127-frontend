"use client";

import { useState } from "react";
import type { ManagedPaymentMethod } from "@/features/payment-methods";
import { PAYMENT_METHOD_OPTIONS, resolvePaymentMethod, type PaymentMethod } from "@/features/payment";

type PaymentMethodSelectorProps = {
  methods: ManagedPaymentMethod[];
  selectedMethodId: string;
  selectedMethod: ManagedPaymentMethod | undefined;
  onSelect: (methodId: string) => void;
  isLoading: boolean;
};

function maskBankAccountNumber(accountNumber?: string): string | undefined {
  if (!accountNumber) return undefined;
  return `**** ${accountNumber.slice(-4)}`;
}

function describeMethod(method: ManagedPaymentMethod): string {
  return method.bankName ?? method.name;
}

/**
 * PHƯƠNG THỨC THANH TOÁN — đúng 3 Radio Card cố định (PaymentMethod: CASH/
 * QR/DIGITAL_WALLET, xem features/payment/types/payment.types.ts) thay vì
 * hiện thẳng 4 PaymentMethodGroup thật — "card" + "e_wallet" gộp chung 1 card
 * "DIGITAL_WALLET" vì cùng cần chọn Provider bên thứ ba. Card nào không có
 * ManagedPaymentMethod nào đang bật thì ẩn hẳn.
 *
 * Card chỉ 1 phương thức (vd. CASH) → bấm card là chọn luôn. Card ≥2 phương
 * thức (vd. QR có Vietcombank + MB Bank, DIGITAL_WALLET có Apple Pay + Google
 * Pay) → bấm card mở rộng danh sách bên trong để chọn cụ thể — khách LUÔN
 * chọn đúng 1 ManagedPaymentMethod (paymentMethodId), field này đã mang đủ cả
 * PaymentMethod lẫn phương thức con (suy ra qua resolvePaymentMethod), không
 * lưu thêm state nào khác (tránh derived state trùng lặp).
 */
export function PaymentMethodSelector({
  methods,
  selectedMethodId,
  selectedMethod,
  onSelect,
  isLoading,
}: PaymentMethodSelectorProps) {
  const [expandedMethod, setExpandedMethod] = useState<PaymentMethod | null>(null);

  function handleSelectCard(paymentMethod: PaymentMethod, methodsInGroup: ManagedPaymentMethod[]) {
    if (methodsInGroup.length === 1) {
      onSelect(methodsInGroup[0].id);
      setExpandedMethod(null);
      return;
    }
    setExpandedMethod((current) => (current === paymentMethod ? null : paymentMethod));
  }

  function handleSelectMethod(methodId: string) {
    onSelect(methodId);
    setExpandedMethod(null);
  }

  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">PHƯƠNG THỨC THANH TOÁN</h2>

      {isLoading ? (
        <p className="text-[13px] text-[#4b4b4b]">Đang tải phương thức thanh toán...</p>
      ) : (
        <div className="space-y-3 text-[13px]">
          {PAYMENT_METHOD_OPTIONS.map((option) => {
            const methodsInGroup = methods.filter((method) => resolvePaymentMethod(method.group) === option.value);
            if (methodsInGroup.length === 0) return null;

            const isCardSelected = selectedMethod ? resolvePaymentMethod(selectedMethod.group) === option.value : false;
            const isExpanded = expandedMethod === option.value;
            const hasMultipleOptions = methodsInGroup.length > 1;

            return (
              <div
                key={option.value}
                className={[
                  "overflow-hidden rounded-xl border transition",
                  isCardSelected ? "border-brand-green" : "border-[#0f9b55]/30",
                ].join(" ")}
              >
                <label
                  className={[
                    "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition",
                    isCardSelected ? "bg-brand-cream/50" : "bg-white hover:bg-brand-cream/20",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={isCardSelected}
                    onChange={() => handleSelectCard(option.value, methodsInGroup)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f9b55]"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block font-black text-brand-greenDark">{option.label}</span>
                    <span className="mt-0.5 block text-[12px] text-[#4b4b4b]">{option.description}</span>

                    {isCardSelected && selectedMethod && (
                      <span className="mt-1 block truncate text-[12px] font-bold text-brand-green">
                        Đã chọn: {describeMethod(selectedMethod)}
                        {maskBankAccountNumber(selectedMethod.bankAccountNumber) && (
                          <> · {maskBankAccountNumber(selectedMethod.bankAccountNumber)}</>
                        )}
                      </span>
                    )}
                  </span>

                  {hasMultipleOptions && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        setExpandedMethod((current) => (current === option.value ? null : option.value));
                      }}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Thu gọn danh sách" : "Xem danh sách lựa chọn"}
                      className={`mt-0.5 shrink-0 text-[11px] text-[#9a9a9a] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      ▾
                    </button>
                  )}
                </label>

                {isExpanded && (
                  <div className="border-t border-[#0f9b55]/20">
                    {methodsInGroup.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => handleSelectMethod(method.id)}
                        className={[
                          "flex w-full items-center justify-between gap-3 border-b border-[#0f9b55]/10 px-4 py-3 text-left transition last:border-b-0 hover:bg-brand-cream/30",
                          selectedMethodId === method.id ? "bg-brand-cream/40" : "",
                        ].join(" ")}
                      >
                        <span className="min-w-0">
                          <span className="block font-bold text-brand-greenDark">{describeMethod(method)}</span>

                          {maskBankAccountNumber(method.bankAccountNumber) && (
                            <span className="block text-[12px] text-[#4b4b4b]">
                              {maskBankAccountNumber(method.bankAccountNumber)}
                            </span>
                          )}

                          {method.group !== "bank_transfer" && method.description && (
                            <span className="block text-[12px] text-[#4b4b4b]">{method.description}</span>
                          )}
                        </span>

                        {selectedMethodId === method.id && (
                          <span className="shrink-0 text-[16px] text-brand-green">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
