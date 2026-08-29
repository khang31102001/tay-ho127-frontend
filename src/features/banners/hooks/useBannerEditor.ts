"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { ManagedMedia } from "@/features/media";
import { listMedia } from "@/features/media";

import type { BannerPlacement } from "../types/banner.types";
import {
  createBanner,
  deleteBanner,
  getBannerById,
  updateBanner,
} from "../services/banner.service";

export type BannerFormValue = {
  name: string;
  desktopMediaId: string | null;
  mobileMediaId: string | null;
  altText: string;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaUrl: string;
  placement: BannerPlacement;
  /** "YYYY-MM-DD" cho input type="date", rỗng = không giới hạn. */
  startAt: string;
  endAt: string;
  displayOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: BannerFormValue = {
  name: "",
  desktopMediaId: null,
  mobileMediaId: null,
  altText: "",
  heading: "",
  subheading: "",
  ctaLabel: "",
  ctaUrl: "",
  placement: "HOME_HERO",
  startAt: "",
  endAt: "",
  displayOrder: 1,
  isActive: true,
};

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function toIsoOrNull(dateInputValue: string): string | null {
  return dateInputValue ? new Date(dateInputValue).toISOString() : null;
}

type UseBannerEditorParams = {
  id?: string;
};

export function useBannerEditor({ id }: UseBannerEditorParams) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [form, setForm] = useState<BannerFormValue>(EMPTY_FORM);
  const [mediaOptions, setMediaOptions] = useState<ManagedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    listMedia().then(setMediaOptions);
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    getBannerById(id).then((banner) => {
      if (isCancelled) {
        return;
      }

      if (banner) {
        setForm({
          name: banner.name,
          desktopMediaId: banner.desktopMediaId,
          mobileMediaId: banner.mobileMediaId,
          altText: banner.altText,
          heading: banner.heading ?? "",
          subheading: banner.subheading ?? "",
          ctaLabel: banner.ctaLabel ?? "",
          ctaUrl: banner.ctaUrl ?? "",
          placement: banner.placement,
          startAt: toDateInputValue(banner.startAt),
          endAt: toDateInputValue(banner.endAt),
          displayOrder: banner.displayOrder,
          isActive: banner.isActive,
        });
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof BannerFormValue>(field: K, value: BannerFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSave() {
    if (form.startAt && form.endAt && form.startAt > form.endAt) {
      throw new Error("Ngày bắt đầu phải trước ngày kết thúc.");
    }

    const payload = {
      name: form.name,
      desktopMediaId: form.desktopMediaId,
      mobileMediaId: form.mobileMediaId,
      altText: form.altText,
      heading: form.heading || undefined,
      subheading: form.subheading || undefined,
      ctaLabel: form.ctaLabel || undefined,
      ctaUrl: form.ctaUrl || undefined,
      placement: form.placement,
      startAt: toIsoOrNull(form.startAt),
      endAt: toIsoOrNull(form.endAt),
      displayOrder: form.displayOrder,
      isActive: form.isActive,
    };

    if (isEditMode) {
      await updateBanner(id, payload);
    } else {
      await createBanner(payload);
    }
  }

  async function handleDelete() {
    if (isEditMode) {
      await deleteBanner(id);
    }
  }

  function goToExplore() {
    router.push("/admin/content/banners");
  }

  return {
    form,
    updateField,
    mediaOptions,
    isLoading,
    isEditMode,
    handleSave,
    handleDelete,
    goToExplore,
  };
}
