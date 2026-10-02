"use client";

import { useEffect, useState } from "react";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";

import { getSeoSettings, updateSeoSettings } from "../services/seo-settings.service";
import type { ManagedSeoSettings, SeoSettingsFormValue } from "../types/seo-settings.types";

function toFormValue(settings: ManagedSeoSettings): SeoSettingsFormValue {
  const { id: _id, updatedAt: _updatedAt, ...rest } = settings;
  return rest;
}

export function useSeoSettingsForm() {
  const [form, setForm] = useState<SeoSettingsFormValue | null>(null);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listMedia().then(setMediaOptions);
    getSeoSettings().then((settings) => {
      setForm(toFormValue(settings));
      setIsLoading(false);
    });
  }, []);

  function updateField<K extends keyof SeoSettingsFormValue>(field: K, value: SeoSettingsFormValue[K]) {
    setForm((previous) => (previous ? { ...previous, [field]: value } : previous));
  }

  async function handleSave() {
    if (!form) return;

    if (!form.defaultDescription.trim()) {
      throw new Error("Mô tả mặc định không được để trống.");
    }

    const updated = await updateSeoSettings(form);
    setForm(toFormValue(updated));
  }

  return { form, isLoading, mediaOptions, updateField, handleSave };
}
