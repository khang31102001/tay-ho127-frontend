import type { ChangeEvent } from "react";
import { RadioOption } from "@/components/ui/RadioOption";
import { formatCurrency } from "@/lib/format-currency";
import type { ManagedDeliveryMethod } from "@/features/delivery-methods";

type FulfillmentMethod = "pickup" | "delivery";

type FulfillmentSelectorProps = {
  methods: ManagedDeliveryMethod[];
  selectedMethodId: string;
  onSelectMethod: (methodId: string) => void;
  address: string;
  onAddressChange: (event: ChangeEvent<HTMLInputElement>) => void;
  addressError?: string;
  shippingFee: number;
  isLoading: boolean;
};

function formatEstimate(minMinutes?: number, maxMinutes?: number): string | null {
  if (minMinutes === undefined && maxMinutes === undefined) return null;
  if (minMinutes !== undefined && maxMinutes !== undefined) return `${minMinutes}–${maxMinutes} phút`;
  return `${minMinutes ?? maxMinutes} phút`;
}

/**
 * #7 FULFILLMENT — chuẩn hóa 2 tầng: (1) Cách nhận hàng = PICKUP/DELIVERY,
 * (2) nếu DELIVERY mới hiện danh sách DeliveryMethod cụ thể (STANDARD/EXPRESS
 * ở đây là "Giao trong/ngoài bán kính 5km", xem features/delivery-methods) +
 * địa chỉ giao hàng — 2 field này gắn chặt với việc chọn Delivery nên đặt
 * chung 1 component thay vì tách rời như trước (địa chỉ từng nằm ở
 * CustomerInformationForm). Trước đây trang chỉ hiện 1 danh sách phẳng gồm cả
 * pickup lẫn delivery — không đúng khái niệm FulfillmentMethod của #7.
 */
export function FulfillmentSelector({
  methods,
  selectedMethodId,
  onSelectMethod,
  address,
  onAddressChange,
  addressError,
  shippingFee,
  isLoading,
}: FulfillmentSelectorProps) {
  const pickupMethods = methods.filter((method) => method.type === "pickup");
  const deliveryTypeMethods = methods.filter((method) => method.type === "delivery");
  const selectedMethod = methods.find((method) => method.id === selectedMethodId);
  const activeFulfillment: FulfillmentMethod = selectedMethod?.type === "pickup" ? "pickup" : "delivery";

  function handleFulfillmentChange(value: FulfillmentMethod) {
    if (value === "pickup") {
      const target = pickupMethods.find((method) => method.isDefault) ?? pickupMethods[0];
      if (target) onSelectMethod(target.id);
    } else {
      const target = deliveryTypeMethods.find((method) => method.isDefault) ?? deliveryTypeMethods[0];
      if (target) onSelectMethod(target.id);
    }
  }

  return (
    <section className="rounded-lg bg-white p-7 shadow-soft">
      <h2 className="mb-4 text-[18px] font-black text-brand-green">CÁCH NHẬN HÀNG</h2>

      {isLoading ? (
        <p className="text-[13px] text-[#4b4b4b]">Đang tải hình thức nhận hàng...</p>
      ) : (
        <div className="space-y-4 text-[13px]">
          <div className="flex flex-wrap gap-6">
            {pickupMethods.length > 0 && (
              <RadioOption<FulfillmentMethod>
                name="fulfillmentMethod"
                value="pickup"
                checked={activeFulfillment === "pickup"}
                onChange={handleFulfillmentChange}
                label={<span className="font-bold text-brand-greenDark">Nhận tại quán</span>}
              />
            )}
            {deliveryTypeMethods.length > 0 && (
              <RadioOption<FulfillmentMethod>
                name="fulfillmentMethod"
                value="delivery"
                checked={activeFulfillment === "delivery"}
                onChange={handleFulfillmentChange}
                label={<span className="font-bold text-brand-greenDark">Giao hàng</span>}
              />
            )}
          </div>

          {activeFulfillment === "pickup" ? (
            <div className="rounded-xl border border-[#0f9b55] bg-brand-cream/40 px-4 py-3">
              <p className="font-bold text-brand-greenDark">Địa chỉ nhận hàng</p>
              <p className="mt-0.5 text-[#4b4b4b]">{selectedMethod?.pickupAddress ?? "Cửa hàng"}</p>

              {pickupMethods.length > 1 && (
                <div className="mt-3 space-y-2">
                  {pickupMethods.map((method) => (
                    <RadioOption<string>
                      key={method.id}
                      name="deliveryMethodId"
                      value={method.id}
                      checked={selectedMethodId === method.id}
                      onChange={onSelectMethod}
                      label={method.name}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <label className="block">
                <span className="sr-only">Địa chỉ giao hàng</span>

                <input
                  type="text"
                  name="address"
                  value={address}
                  onChange={onAddressChange}
                  placeholder="Địa chỉ giao hàng"
                  autoComplete="street-address"
                  className={[
                    "h-10 w-full rounded-full border px-4 outline-none transition",
                    "focus:ring-2 focus:ring-[#0f9b55]/20",
                    addressError ? "border-red-500" : "border-[#0f9b55]",
                  ].join(" ")}
                />

                {addressError && <span className="mt-1 block px-3 text-xs text-red-500">{addressError}</span>}
              </label>

              <div className="grid gap-4 md:grid-cols-[1fr_110px]">
                <div className="space-y-3">
                  {deliveryTypeMethods.map((method) => {
                    const estimate = formatEstimate(method.estimatedMinMinutes, method.estimatedMaxMinutes);
                    return (
                      <RadioOption<string>
                        key={method.id}
                        name="deliveryMethodId"
                        value={method.id}
                        checked={selectedMethodId === method.id}
                        onChange={onSelectMethod}
                        label={
                          <span>
                            {method.name}
                            {estimate && <span className="text-[#4b4b4b]"> · {estimate}</span>}
                            {method.freeShippingThreshold !== undefined && (
                              <span className="block text-[11px] text-[#4b4b4b]">
                                Miễn phí cho đơn từ {formatCurrency(method.freeShippingThreshold)}
                              </span>
                            )}
                          </span>
                        }
                      />
                    );
                  })}
                </div>

                <div className="text-left font-black md:text-right">
                  {shippingFee === 0 ? (
                    <p className="text-brand-green">Freeship!</p>
                  ) : (
                    <p className="text-brand-red">{formatCurrency(shippingFee)}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
