"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { CartItem } from "@/features/cart";
import type { PopupStatus } from "@/components/shared/StatusPopup";
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

import {
  CheckoutFormState,
  CheckoutFormErrors,
  CheckoutTotals,
  INITIAL_CHECKOUT_FORM,
} from "../types/checkout.types";

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

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_CHECKOUT_FORM);
  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [popup, setPopup] = useState<PopupState>({
    open: false,
    status: "success",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deliveryMethods, setDeliveryMethods] = useState<ManagedDeliveryMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<ManagedPaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  // Checkout PHẢI lấy danh sách phương thức động từ Admin — không hard-code.
  useEffect(() => {
    Promise.all([listAvailableDeliveryMethods(), listAvailablePaymentMethods()]).then(
      ([availableDeliveryMethods, availablePaymentMethods]) => {
        setDeliveryMethods(availableDeliveryMethods);
        setPaymentMethods(availablePaymentMethods);
        setForm((previous) => ({
          ...previous,
          deliveryMethodId: pickDefault(availableDeliveryMethods)?.id ?? "",
          paymentMethodId: pickDefault(availablePaymentMethods)?.id ?? "",
        }));
        setIsLoadingMethods(false);
      },
    );
  }, []);

  const selectedDeliveryMethod = useMemo(
    () => deliveryMethods.find((method) => method.id === form.deliveryMethodId),
    [deliveryMethods, form.deliveryMethodId],
  );

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.id === form.paymentMethodId),
    [paymentMethods, form.paymentMethodId],
  );

  /*
   * Giảm giá hiện đang bằng 0.
   * Sau này có thể thay bằng giá trị voucher hoặc promotion.
   */
  const discountAmount = 0;

  const totals = useMemo<CheckoutTotals>(() => {
    const shippingFee = selectedDeliveryMethod ? resolveDeliveryFee(selectedDeliveryMethod, totalPrice) : 0;
    const grandTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

    return {
      subtotal: totalPrice,
      shippingFee,
      discount: discountAmount,
      grandTotal,
    };
  }, [totalPrice, selectedDeliveryMethod]);

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

    // Chỉ bắt buộc địa chỉ khi giao tận nơi — "Tự đến lấy" dùng địa chỉ cửa hàng, không cần khách nhập.
    if (selectedDeliveryMethod?.type !== "pickup" && !form.address.trim()) {
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

    try {
      const order = await createOrder({
        customerId: null,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        deliveryAddressSnapshot:
          selectedDeliveryMethod.type === "pickup"
            ? (selectedDeliveryMethod.pickupAddress ?? selectedDeliveryMethod.name)
            : form.address.trim(),
        paymentMethodCode: selectedPaymentMethod.code,
        deliveryMethodCode: selectedDeliveryMethod.code,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        note: form.note.trim() || undefined,
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
      router.push(`/checkout/thanh-cong/${order.id}`);
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
    totals,
    deliveryMethods,
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
