"use client";

import { useEffect, useState } from "react";

import type { SeoEntityType } from "../types/seo-metadata.types";
import { EMPTY_SEO_SCHEMA_FORM, type SeoSchemaFormValue, type SeoSchemaType } from "../types/seo-schema.types";
import { deleteSeoSchema, getSeoSchema, upsertSeoSchema } from "../services/seo-schema.service";

/**
 * Load + save 1 dòng SeoSchema (config/customJsonLd/isCustomOverride/isActive)
 * cho (entityType, entityId, schemaType) — cùng quy ước entityId=undefined
 * ("entity chưa tạo") như useSeoMetadataForm.ts.
 *
 * Task 10: validate JSON trước khi lưu khi isCustomOverride=true — throw lỗi
 * rõ ràng để UI hiển thị (không cho lưu JSON hỏng, tránh phá trang Storefront
 * — xem seo-schema-resolver.service.ts vẫn có fallback phòng hờ thêm 1 lớp).
 */
export function useSeoSchemaForm(
  entityType: SeoEntityType,
  entityId: string | null | undefined,
  schemaType: SeoSchemaType,
) {
  const [form, setForm] = useState<SeoSchemaFormValue>(EMPTY_SEO_SCHEMA_FORM);
  const [isLoading, setIsLoading] = useState(entityId !== undefined);
  const [hasOverride, setHasOverride] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (entityId === undefined) {
      setForm(EMPTY_SEO_SCHEMA_FORM);
      setHasOverride(false);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    getSeoSchema(entityType, entityId, schemaType).then((existing) => {
      if (isCancelled) return;

      if (existing) {
        setForm({
          config: existing.config,
          customJsonLd: existing.customJsonLd,
          isCustomOverride: existing.isCustomOverride,
          isActive: existing.isActive,
        });
        setHasOverride(true);
      } else {
        setForm(EMPTY_SEO_SCHEMA_FORM);
        setHasOverride(false);
      }

      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, schemaType]);

  function updateField<K extends keyof SeoSchemaFormValue>(field: K, value: SeoSchemaFormValue[K]) {
    setJsonError(null);
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function updateConfigField(key: string, value: string) {
    setForm((previous) => ({ ...previous, config: { ...previous.config, [key]: value } }));
  }

  function validate(): boolean {
    if (form.isCustomOverride && form.customJsonLd) {
      try {
        JSON.parse(form.customJsonLd);
        setJsonError(null);
        return true;
      } catch {
        setJsonError("JSON-LD không hợp lệ — kiểm tra lại cú pháp (thiếu dấu ngoặc/dấu phẩy?).");
        return false;
      }
    }

    setJsonError(null);
    return true;
  }

  async function save() {
    if (entityId === undefined) {
      throw new Error("Chưa thể lưu Schema khi entity chưa được tạo — lưu entity trước.");
    }

    if (!validate()) {
      throw new Error("JSON-LD không hợp lệ — sửa lại trước khi lưu.");
    }

    const saved = await upsertSeoSchema(entityType, entityId, schemaType, form);
    setHasOverride(true);
    return saved;
  }

  async function reset() {
    if (entityId === undefined) {
      setForm(EMPTY_SEO_SCHEMA_FORM);
      return;
    }

    await deleteSeoSchema(entityType, entityId, schemaType);
    setForm(EMPTY_SEO_SCHEMA_FORM);
    setHasOverride(false);
  }

  return { form, updateField, updateConfigField, isLoading, hasOverride, jsonError, validate, save, reset };
}
