"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { CartItem } from "@/features/cart";
import { calculateCartItemTotal, consumeCartReviewedFlag, useCart } from "@/features/cart";
import type { PopupStatus } from "@/components/shared/StatusPopup";
import { useAuth } from "@/features/auth";
import { createOrder } from "@/features/orders";
import { createPayment } from "@/features/payments";
import {
  listAvailablePaymentMethods,
  type ManagedPaymentMethod,
} from "@/features/payment-methods";
import {
  listAvailableDeliveryMethods,
  resolveDeliveryFee,
  type ManagedDeliveryMethod,
} from "@/features/delivery-methods";
import { createPaymentSession, resolveDigitalWalletProvider, resolvePaymentMethod } from "@/features/payment";

import {
  CheckoutFormState,
  CheckoutFormErrors,
  CheckoutTotals,
  INITIAL_CHECKOUT_FORM,
} from "../types/checkout.types";
import { applyDiscountCode, type AppliedDiscount } from "../services/discount-code.service";

interface PopupState {
  open: boolean;
  status: PopupStatus;
  title: string;
  description: string;
}

type UseCheckoutFormParams = {
  cartItems: CartItem[];
  totalPrice: number;
  clearCart: () => void;
};

/** Chọn phương thức mặc định (isDefault) nếu có, không thì lấy phần tử đầu. */
function pickDefault<T extends { id: string; isDefault: boolean }>(methods: T[]): T | undefined {
  return methods.find((method) => method.isDefault) ?? methods[0];
}

export function useCheckoutForm({ cartItems, totalPrice, clearCart }: UseCheckoutFormParams) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  /**
   * deliveryMethodId/address/utensils/note/orderOptionSelections đã được
   * khách chọn ở Cart Page (CartContext) trước khi vào Checkout — đọc lại ở
   * đây để tính totals và gửi lên createOrder()/createPaymentSession(),
   * Checkout không sở hữu state của các mục này nữa.
   */
  const { deliveryMethodId, address, utensils, note, orderOptionSelections } = useCart();

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_CHECKOUT_FORM);

  /**
   * Checkout bắt buộc phải đi qua Cart Review (/gio-hang) trước — chặn truy
   * cập trực tiếp (gõ URL, bookmark, back/forward) bằng cờ markCartReviewed()
   * chỉ được set khi bấm "Tiến hành đặt hàng" ở Cart Page. `null` = đang kiểm
   * tra, chưa render form để tránh nháy nội dung Checkout trước khi xác nhận.
   */
  const [isCartReviewed, setIsCartReviewed] = useState<boolean | null>(null);

  /**
   * consumeCartReviewedFlag() xóa cờ ngay khi đọc (chỉ hợp lệ 1 lần) nên
   * effect bên dưới không được chạy 2 lần — nếu không, lần chạy thứ 2 của
   * React StrictMode (dev) sẽ đọc cờ rỗng do lần đầu đã xóa, tưởng nhầm là
   * chưa qua Cart Review rồi redirect ngược lại /gio-hang.
   */
  const hasVerifiedCartReviewRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedCartReviewRef.current) return;
    hasVerifiedCartReviewRef.current = true;

    if (consumeCartReviewedFlag()) {
      setIsCartReviewed(true);
    } else {
      router.replace("/gio-hang");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đã đăng nhập → điền sẵn thông tin đã biết, khách vẫn có thể sửa lại trước khi đặt hàng.
  useEffect(() => {
    if (!currentUser) return;

    setForm((previous) => ({
      ...previous,
      customerName: previous.customerName || currentUser.name,
      phone: previous.phone || currentUser.phone || "",
      email: previous.email || currentUser.email || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);
  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [popup, setPopup] = useState<PopupState>({
    open: false,
    status: "success",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Sinh 1 lần cho cả vòng đời component (giữ nguyên qua các lần thử lại nếu
   * đặt hàng thất bại) — chống double-submit (#27). Rời trang/mount lại (đặt
   * đơn khác) sẽ tự có key mới.
   */
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const [deliveryMethods, setDeliveryMethods] = useState<ManagedDeliveryMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<ManagedPaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  /**
   * Checkout PHẢI lấy danh sách phương thức động từ Admin — không hard-code.
   * Vẫn fetch deliveryMethods ở đây (dù không còn UI chọn) để tra cứu lại
   * object đầy đủ (code/pickupAddress/type) ứng với deliveryMethodId đã chọn
   * từ Cart — cần cho việc tính totals.shippingFee và tạo Order bên dưới.
   */
  useEffect(() => {
    Promise.all([listAvailableDeliveryMethods(), listAvailablePaymentMethods()]).then(
      ([availableDeliveryMethods, availablePaymentMethods]) => {
        setDeliveryMethods(availableDeliveryMethods);
        setPaymentMethods(availablePaymentMethods);
        setForm((previous) => ({
          ...previous,
          paymentMethodId: pickDefault(availablePaymentMethods)?.id ?? "",
        }));
        setIsLoadingMethods(false);
      },
    );
  }, []);

  const selectedDeliveryMethod = useMemo(
    () => deliveryMethods.find((method) => method.id === deliveryMethodId),
    [deliveryMethods, deliveryMethodId],
  );

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.id === form.paymentMethodId),
    [paymentMethods, form.paymentMethodId],
  );

  /**
   * Mã giảm giá đã áp dụng — Checkout State DUY NHẤT giữ dữ liệu này (Mini
   * Cart/Cart Page không có khái niệm mã giảm giá, chỉ Checkout mới nhập).
   * `discountAmount` đã được `applyDiscountCode()` tính sẵn theo subtotal tại
   * thời điểm áp dụng (snapshot) — Checkout Review không cho sửa số lượng món
   * nên không cần tính lại khi subtotal đổi.
   */
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | undefined>();

  async function handleApplyDiscountCode(code: string) {
    setIsApplyingDiscount(true);
    setDiscountError(undefined);

    try {
      const shippingFee = selectedDeliveryMethod ? resolveDeliveryFee(selectedDeliveryMethod, totalPrice) : 0;
      const result = await applyDiscountCode(code, {
        subtotal: totalPrice,
        shippingFee,
        items: cartItems.map((item) => ({ productId: item.productId, lineTotal: calculateCartItemTotal(item) })),
      });
      setAppliedDiscount(result);
    } catch (error) {
      setAppliedDiscount(null);
      setDiscountError(error instanceof Error ? error.message : "Không thể áp dụng mã giảm giá.");
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  function handleRemoveDiscountCode() {
    setAppliedDiscount(null);
    setDiscountError(undefined);
  }

  /**
   * `otherFee`/`tax` luôn 0 — chưa có business rule nào tạo phí khác, và giá
   * món hiện tại đã bao gồm VAT (không tách riêng) nên KHÔNG cộng thêm lần
   * hai. Để sẵn field trong CheckoutTotals cho khi có business rule thật, UI
   * (CheckoutPriceSummary) tự ẩn dòng tương ứng khi giá trị = 0.
   */
  const otherFee = 0;
  const tax = 0;

  const totals = useMemo<CheckoutTotals>(() => {
    const shippingFee = selectedDeliveryMethod ? resolveDeliveryFee(selectedDeliveryMethod, totalPrice) : 0;
    const discount = appliedDiscount?.discountAmount ?? 0;
    // Chặn shippingDiscount không vượt quá shippingFee thật tại thời điểm tính lại
    // (vd. đổi Delivery Method sau khi đã áp mã "free_shipping" khiến phí thấp hơn snapshot).
    const shippingDiscount = Math.min(appliedDiscount?.shippingDiscount ?? 0, shippingFee);
    const grandTotal = Math.max(0, totalPrice - discount + shippingFee - shippingDiscount + otherFee + tax);

    return {
      subtotal: totalPrice,
      shippingFee,
      discount,
      shippingDiscount,
      otherFee,
      tax,
      grandTotal,
    };
  }, [totalPrice, selectedDeliveryMethod, appliedDiscount]);

  function showPopup(status: PopupStatus, title: string, description: string) {
    setPopup({ open: true, status, title, description });
  }

  function updateFormField<K extends keyof CheckoutFormState>(field: K, value: CheckoutFormState[K]) {
    setForm((previousForm) => ({ ...previousForm, [field]: value }));

    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [field]: undefined,
      submit: undefined,
    }));
  }

  function handleTextInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    const field = name as "customerName" | "phone" | "email";
    updateFormField(field, value);
  }

  function validateCheckoutForm(): CheckoutFormErrors {
    const errors: CheckoutFormErrors = {};

    const normalizedPhone = form.phone.replace(/[\s.-]/g, "");

    if (!form.customerName.trim()) {
      errors.customerName = "Vui lòng nhập tên người đặt hàng.";
    }

    if (!normalizedPhone) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^(0\d{9}|\+84\d{9})$/.test(normalizedPhone)) {
      errors.phone = "Số điện thoại không đúng định dạng.";
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartItems.length === 0) {
      showPopup("error", "Giỏ hàng đang trống.", "Vui lòng chọn món trước khi đặt hàng.");
      return;
    }

    if (!selectedDeliveryMethod || !selectedPaymentMethod) {
      showPopup("error", "Chưa thể đặt hàng.", "Vui lòng chọn hình thức giao hàng và thanh toán.");
      return;
    }

    const validationErrors = validateCheckoutForm();

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      showPopup("error", "Thông tin không hợp lệ.", "Vui lòng kiểm tra lại thông tin đã nhập.");
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const deliveryAddressSnapshot =
      selectedDeliveryMethod.type === "pickup"
        ? (selectedDeliveryMethod.pickupAddress ?? selectedDeliveryMethod.name)
        : address.trim();

    const paymentMethod = resolvePaymentMethod(selectedPaymentMethod.group);

    try {
      // CASE A — CASH: không yêu cầu xác nhận thanh toán online, tạo Order
      // ngay như trước.
      if (paymentMethod === "CASH") {
        const order = await createOrder({
          customerId: currentUser?.customerId ?? null,
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          deliveryAddressSnapshot,
          paymentMethodCode: selectedPaymentMethod.code,
          deliveryMethodCode: selectedDeliveryMethod.code,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            note: item.specialInstructions,
            modifiers: item.modifiers?.map((modifier) => ({
              groupId: modifier.groupId,
              optionId: modifier.optionId,
            })),
          })),
          wantsUtensils: utensils === "yes",
          note: note.trim() || undefined,
          orderOptions: orderOptionSelections.map((selection) => ({
            groupId: selection.groupId,
            optionId: selection.optionId,
          })),
          discount: totals.discount,
          discountCode: appliedDiscount?.discountCode,
          promotionId: appliedDiscount?.promotionId,
          shippingDiscount: totals.shippingDiscount,
          idempotencyKey,
        });

        try {
          await createPayment({
            orderId: order.id,
            orderCode: order.orderCode,
            paymentMethodCode: order.paymentMethodCode,
            paymentMethodLabel: order.paymentMethodLabel,
            amount: order.totalAmount,
          });
        } catch (paymentError) {
          // Đơn đã tạo thành công — không chặn điều hướng chỉ vì tạo bản ghi Payment lỗi.
          console.error("Không thể khởi tạo giao dịch thanh toán:", paymentError);
        }

        clearCart();
        router.push(`/don-hang/${order.orderCode}`);
        return;
      }

      // CASE B — QR/DIGITAL_WALLET: TUYỆT ĐỐI KHÔNG tạo Order ngay. Tạo
      // PaymentSession ("giữ chỗ") rồi đưa khách sang Payment Page — Order/
      // Payment thật chỉ được tạo sau khi khách xác nhận đã thanh toán (xem
      // confirmPaymentSession trong features/payment). KHÔNG clearCart() ở
      // đây — nếu khách hủy giữa chừng, Cart vẫn còn nguyên để quay lại
      // chỉnh sửa.
      const session = await createPaymentSession({
        customerId: currentUser?.customerId ?? null,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        items: cartItems,
        deliveryMethodCode: selectedDeliveryMethod.code,
        deliveryMethodLabel: selectedDeliveryMethod.name,
        isPickup: selectedDeliveryMethod.type === "pickup",
        deliveryAddressSnapshot,
        wantsUtensils: utensils === "yes",
        note: note.trim() || undefined,
        orderOptionSelections,
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        discount: totals.discount,
        discountCode: appliedDiscount?.discountCode,
        promotionId: appliedDiscount?.promotionId,
        shippingDiscount: totals.shippingDiscount,
        totalAmount: totals.grandTotal,
        paymentMethod,
        digitalWalletProvider:
          paymentMethod === "DIGITAL_WALLET" ? resolveDigitalWalletProvider(selectedPaymentMethod.code) : undefined,
        paymentMethodCode: selectedPaymentMethod.code,
        paymentMethodLabel: selectedPaymentMethod.name,
        bankName: selectedPaymentMethod.bankName,
        bankAccountNumber: selectedPaymentMethod.bankAccountNumber,
        bankAccountHolder: selectedPaymentMethod.bankAccountHolder,
        idempotencyKey,
      });

      router.push(`/payment/${session.id}`);
    } catch (error) {
      console.error("Submit checkout error:", error);
      showPopup("error", "Không thể tạo đơn hàng.", error instanceof Error ? error.message : "Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function getInputClass(hasError?: boolean) {
    return [
      "h-10 w-full rounded-full border px-4 outline-none transition",
      "focus:ring-2 focus:ring-[#0f9b55]/20",
      hasError ? "border-red-500" : "border-[#0f9b55]",
    ].join(" ");
  }

  return {
    form,
    formErrors,
    popup,
    setPopup,
    isSubmitting,
    isCartReviewed,
    totals,
    appliedDiscount,
    isApplyingDiscount,
    discountError,
    handleApplyDiscountCode,
    handleRemoveDiscountCode,
    paymentMethods,
    selectedDeliveryMethod,
    selectedPaymentMethod,
    isLoadingMethods,
    updateFormField,
    handleTextInputChange,
    handleSubmit,
    getInputClass,
  };
}
