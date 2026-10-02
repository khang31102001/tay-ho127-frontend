"use client";

import { useEffect, useState } from "react";

import { EMPTY_SEO_METADATA_FORM, type SeoEntityType, type SeoMetadataFormValue } from "../types/seo-metadata.types";
import { getSeoMetadata, resetSeoMetadata, upsertSeoMetadata } from "../services/seo-metadata.service";

/**
 * Load + save + reset override SEO cho 1 (entityType, entityId). Dùng được ở
 * CẢ 2 nơi:
 * - SeoEditor đứng riêng (Admin > SEO > Metadata > Sửa) — gọi save()/reset()
 *   trực tiếp từ đây, entityId luôn xác định (string) hoặc null (homepage).
 * - Tab "SEO" nhúng trong Product/Category/Article Editor — entityId truyền
 *   thẳng `id` của chính entity đó (string khi sửa, `undefined` khi TẠO MỚI vì
 *   entity chưa tồn tại). Khi entityId=undefined, hook KHÔNG gọi service (chỉ
 *   giữ state cục bộ); sau khi entity được tạo xong và có id thật, nơi gọi tự
 *   `upsertSeoMetadata(entityType, newId, seo.form)` trực tiếp (import từ
 *   "@/features/seo") thay vì gọi save() của hook này — xem ProductEditor.tsx.
 *
 * Lưu ý: entityId=null (không phải undefined) là giá trị hợp lệ riêng cho
 * entityType="homepage" (singleton, không có id) — không dùng null cho ý
 * nghĩa "entity chưa tạo".
 */
export function useSeoMetadataForm(entityType: SeoEntityType, entityId: string | null | undefined) {
  const [form, setForm] = useState<SeoMetadataFormValue>(EMPTY_SEO_METADATA_FORM);
  const [isLoading, setIsLoading] = useState(entityId !== undefined);
  const [hasOverride, setHasOverride] = useState(false);

  useEffect(() => {
    if (entityId === undefined) {
      setForm(EMPTY_SEO_METADATA_FORM);
      setHasOverride(false);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    getSeoMetadata(entityType, entityId).then((existing) => {
      if (isCancelled) return;

      if (existing) {
        const { id: _id, entityType: _type, entityId: _entityId, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } =
          existing;
        setForm(rest);
        setHasOverride(true);
      } else {
        setForm(EMPTY_SEO_METADATA_FORM);
        setHasOverride(false);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
    // entityType/entityId đổi (chuyển sang sửa entity khác) phải load lại từ đầu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  function updateField<K extends keyof SeoMetadataFormValue>(field: K, value: SeoMetadataFormValue[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function save() {
    if (entityId === undefined) {
      throw new Error("Chưa thể lưu SEO khi entity chưa được tạo — lưu entity trước.");
    }

    const saved = await upsertSeoMetadata(entityType, entityId, form);
    setHasOverride(true);
    return saved;
  }

  async function reset() {
    if (entityId === undefined) {
      setForm(EMPTY_SEO_METADATA_FORM);
      return;
    }

    await resetSeoMetadata(entityType, entityId);
    setForm(EMPTY_SEO_METADATA_FORM);
    setHasOverride(false);
  }

  return { form, updateField, isLoading, hasOverride, save, reset };
}
