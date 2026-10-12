"use client";

import { useEffect, useState } from "react";

import { getOrderSettings, updateOrderSettings } from "../services/order-settings.service";
import type { ManagedOrderSettings, OrderSettingsFormValue } from "../types/order-settings.types";

function toFormValue(settings: ManagedOrderSettings): OrderSettingsFormValue {
  return {
    orderCodePrefix: settings.orderCodePrefix,
    orderCodeDateFormat: settings.orderCodeDateFormat,
    orderCodeSequenceLength: settings.orderCodeSequenceLength,
    paymentSessionMinutes: settings.paymentSessionMinutes,
  };
}

export function useOrderSettingsForm() {
  const [form, setForm] = useState<OrderSettingsFormValue | null>(null);
  const [exampleOrderCode, setExampleOrderCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOrderSettings()
      .then((settings) => {
        setForm(toFormValue(settings));
        setExampleOrderCode(settings.exampleOrderCode);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function updateField<K extends keyof OrderSettingsFormValue>(field: K, value: OrderSettingsFormValue[K]) {
    setForm((previous) => (previous ? { ...previous, [field]: value } : previous));
  }

  async function handleSave() {
    if (!form) return;

    if (!form.orderCodePrefix.trim()) {
      throw new Error("Tiền tố mã đơn không được để trống.");
    }

    const updated = await updateOrderSettings({ ...form, orderCodePrefix: form.orderCodePrefix.trim() });
    setForm(toFormValue(updated));
    setExampleOrderCode(updated.exampleOrderCode);
  }

  return { form, exampleOrderCode, isLoading, updateField, handleSave };
}
