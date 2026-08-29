"use client";

import { useEffect, useState } from "react";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";

import { getBrandSettings, updateBrandSettings } from "../services/brand-settings.service";
import type { ManagedBrandSettings } from "../types/brand-settings.types";
import type { SocialLink } from "../types/social-link.types";

export type BrandSettingsFormValue = Omit<ManagedBrandSettings, "id" | "updatedAt">;

function toFormValue(settings: ManagedBrandSettings): BrandSettingsFormValue {
  const { id, updatedAt, ...rest } = settings;
  return rest;
}

export function useBrandSettingsEditor() {
  const [form, setForm] = useState<BrandSettingsFormValue | null>(null);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listMedia().then(setMediaOptions);
    getBrandSettings().then((settings) => {
      setForm(toFormValue(settings));
      setIsLoading(false);
    });
  }, []);

  function updateField<K extends keyof BrandSettingsFormValue>(field: K, value: BrandSettingsFormValue[K]) {
    setForm((previous) => (previous ? { ...previous, [field]: value } : previous));
  }

  function addSocialLink() {
    setForm((previous) => {
      if (!previous) return previous;
      const nextLink: SocialLink = {
        id: `social-${Date.now()}`,
        platform: "website",
        url: "",
        displayOrder: previous.socialLinks.length + 1,
        isActive: true,
      };
      return { ...previous, socialLinks: [...previous.socialLinks, nextLink] };
    });
  }

  function updateSocialLink(id: string, patch: Partial<Omit<SocialLink, "id">>) {
    setForm((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        socialLinks: previous.socialLinks.map((link) => (link.id === id ? { ...link, ...patch } : link)),
      };
    });
  }

  function removeSocialLink(id: string) {
    setForm((previous) => {
      if (!previous) return previous;
      return { ...previous, socialLinks: previous.socialLinks.filter((link) => link.id !== id) };
    });
  }

  async function handleSave() {
    if (!form) return;

    if (!form.name.trim()) {
      throw new Error("Tên thương hiệu không được để trống.");
    }
    if (!form.phone.trim()) {
      throw new Error("Số điện thoại không được để trống.");
    }
    if (!form.addressLine.trim()) {
      throw new Error("Địa chỉ không được để trống.");
    }
    const invalidSocialLink = form.socialLinks.find((link) => !link.url.trim());
    if (invalidSocialLink) {
      throw new Error("Vui lòng nhập URL cho tất cả liên kết mạng xã hội hoặc xóa liên kết trống.");
    }

    const updated = await updateBrandSettings(form);
    setForm(toFormValue(updated));
  }

  return {
    form,
    isLoading,
    mediaOptions,
    updateField,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    handleSave,
  };
}
