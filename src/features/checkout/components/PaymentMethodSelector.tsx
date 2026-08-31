import { RadioOption } from "@/components/ui/RadioOption";
import { formatCurrency } from "@/lib/format-currency";
import { PAYMENT_METHOD_GROUP_OPTIONS, type ManagedPaymentMethod } from "@/features/payment-methods";

type PaymentMethodSelectorProps = {
  methods: ManagedPaymentMethod[];
  selectedMethodId: string;
  selectedMethod: ManagedPaymentMethod | undefined;
  onSelect: (methodId: string) => void;
  isLoading: boolean;
};

/**
 * #13 PAYMENT METHODS — nhóm theo 4 nhóm chuẩn hóa (COD/CARD/BANK_TRANSFER/
 * E_WALLET, xem PaymentMethodGroup — Phase 0), thay vì 1 danh sách phẳng gộp
 * chung mọi phương thức. Nhóm nào không có phương thức nào đang bật thì ẩn
 * hẳn — không hiện heading trống. Lấy động từ Admin (features/payment-methods),
 * không hard-code phương thức nào ở đây.
 */
export function PaymentMethodSelector({ methods, selectedMethodId, selectedMethod, onSelect, isLoading }: PaymentMethodSelectorProps) {
  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">PHƯƠNG THỨC THANH TOÁN</h2>

      {isLoading ? (
        <p className="text-[13px] text-[#4b4b4b]">Đang tải phương thức thanh toán...</p>
      ) : (
        <div className="space-y-4 text-[13px]">
          {PAYMENT_METHOD_GROUP_OPTIONS.map((group) => {
            const groupMethods = methods.filter((method) => method.group === group.value);
            if (groupMethods.length === 0) return null;

            return (
              <div key={group.value}>
                <p className="mb-2 text-[12px] font-black uppercase tracking-wide text-brand-muted">{group.label}</p>

                <div className="grid gap-3 md:grid-cols-2">
                  {groupMethods.map((method) => (
                    <RadioOption<string>
                      key={method.id}
                      name="paymentMethodId"
                      value={method.id}
                      checked={selectedMethodId === method.id}
                      onChange={onSelect}
                      label={
                        <span>
                          {method.name}
                          {method.minOrderAmount !== undefined && (
                            <span className="block text-[11px] text-[#4b4b4b]">
                              Áp dụng cho đơn từ {formatCurrency(method.minOrderAmount)}
                            </span>
                          )}
                        </span>
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMethod?.bankAccountNumber && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-[13px] leading-6">
          <p className="font-bold text-brand-greenDark">Thông tin chuyển khoản</p>

          {selectedMethod.bankName && <p>Ngân hàng: {selectedMethod.bankName}</p>}
          <p>Số tài khoản: {selectedMethod.bankAccountNumber}</p>
          {selectedMethod.bankAccountHolder && <p>Chủ tài khoản: {selectedMethod.bankAccountHolder}</p>}
          {selectedMethod.instructions && <p>{selectedMethod.instructions}</p>}
        </div>
      )}

      {selectedMethod?.instructions && !selectedMethod.bankAccountNumber && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-[13px] leading-6 text-[#4b4b4b]">
          {selectedMethod.instructions}
        </div>
      )}
    </section>
  );
}
