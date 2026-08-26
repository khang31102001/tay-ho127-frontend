"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  CheckoutFormState,
  CheckoutFormErrors,
  CheckoutOrderPayload,
  CheckoutTotals,
  SHIPPING_FEES,
  SHIPPING_LABELS,
  PAYMENT_LABELS,
  INITIAL_CHECKOUT_FORM,
} from "@/types/checkout";
import type { CartItem } from "@/types/cart";
import type { PopupStatus } from "../common/StatusPopup";

interface PopupState {
  open: boolean;
  status: PopupStatus;
  title: string;
  description: string;
}

type UseCheckoutFormParams = {
  cartItems: CartItem[];
  totalPrice: number;
  onSubmitOrder?: (order: CheckoutOrderPayload) => Promise<void> | void;
};

export function useCheckoutForm({
  cartItems,
  totalPrice,
  onSubmitOrder,
}: UseCheckoutFormParams) {
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_CHECKOUT_FORM);

  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [popup, setPopup] = useState<PopupState>({
    open: false,
    status: "success",
    title: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Giảm giá hiện đang bằng 0.
   * Sau này có thể thay bằng giá trị voucher hoặc promotion.
   */
  const discountAmount = 0;

  /*
   * Tự động tính lại khi:
   * - Sản phẩm hoặc số lượng trong cart thay đổi.
   * - Người dùng thay đổi hình thức giao hàng.
   */
  const totals = useMemo<CheckoutTotals>(() => {
    const shippingFee = SHIPPING_FEES[form.shippingMethod];

    const grandTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

    return {
      subtotal: totalPrice,
      shippingFee,
      discount: discountAmount,
      grandTotal,
    };
  }, [totalPrice, form.shippingMethod]);

  function showPopup(
    status: PopupStatus,
    title: string,
    description: string,
  ) {
    setPopup({
      open: true,
      status,
      title,
      description,
    });
  }

  function updateFormField<K extends keyof CheckoutFormState>(
    field: K,
    value: CheckoutFormState[K],
  ) {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [field]: undefined,
      submit: undefined,
    }));
  }

  function handleTextInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    const field = name as "customerName" | "phone" | "address" | "note";

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

    if (!form.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ giao hàng.";
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartItems.length === 0) {
      showPopup("error", "Giỏ hàng đang trống.", "Vui lòng chọn món trước khi đặt hàng.");
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

    const orderPayload: CheckoutOrderPayload = {
      customer: {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
      },

      shipping: {
        method: form.shippingMethod,
        label: SHIPPING_LABELS[form.shippingMethod],
        fee: totals.shippingFee,
        estimatedDelivery: "Khoảng 1 tiếng",
      },

      payment: {
        method: form.paymentMethod,
        label: PAYMENT_LABELS[form.paymentMethod],
      },

      items: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      })),

      totals,

      createdAt: new Date().toISOString(),
    };

    try {
      /*
       * Truyền orderPayload ra ngoài để gọi API.
       */
      if (onSubmitOrder) {
        await onSubmitOrder(orderPayload);
      } else {
        /*
         * Chạy thử khi chưa nối API.
         */
        console.log("Checkout order:", orderPayload);
      }

      showPopup("success", "Đơn hàng đã được ghi nhận thành công.", "");
    } catch (error) {
      console.error("Submit checkout error:", error);

      showPopup("error", "Không thể tạo đơn hàng.", "Vui lòng thử lại.");
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
    totals,
    updateFormField,
    handleTextInputChange,
    handleSubmit,
    getInputClass,
  };
}
