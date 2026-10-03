import { adminApi } from "@/lib/http/admin-api";
import { isApiError } from "@/lib/http/api-error";

import type { SeoEntityType } from "../types/seo-metadata.types";
import type { ManagedSeoSchema, SeoSchemaFormValue, SeoSchemaType } from "../types/seo-schema.types";

/**
 * Admin → Product Editor → "Cấu trúc dữ liệu" (Schema.org / JSON-LD), gọi Backend /api/v1/seo/schemas
 * (quyền seo-schemas.view|update|delete). Site đọc dòng đang BẬT qua seo-public.service.ts, không qua file này.
 *
 * Mỗi (entityType, entityId, schemaType) có tối đa 1 dòng; `entityId` là id (Guid) của entity trên Site — KHÔNG phải
 * slug. Chỉ lưu phần KHÔNG derive được từ entity (`config`, vd. sku/brand) hoặc JSON-LD thủ công (`customJsonLd`).
 * Backend trả 400 khi schemaType/entityType lạ, thiếu entityId, JSON-LD không phải JSON object/array, hoặc bật
 * Advanced Mode mà không có JSON-LD.
 */

/** SeoSchemaResponse của Backend — khớp ManagedSeoSchema 1:1. */
type SeoSchemaDto = ManagedSeoSchema;

function keyParams(entityType: SeoEntityType, entityId: string | null, schemaType: SeoSchemaType) {
  return { entityType, entityId, schemaType };
}

/** null khi entity chưa có dòng cho schemaType này (Backend 404) — schema được generate hoàn toàn từ dữ liệu entity. */
export async function getSeoSchema(
  entityType: SeoEntityType,
  entityId: string | null,
  schemaType: SeoSchemaType,
): Promise<ManagedSeoSchema | null> {
  try {
    return await adminApi.get<SeoSchemaDto>("/seo/schemas/lookup", {
      params: keyParams(entityType, entityId, schemaType),
    });
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/** Tạo mới nếu chưa có dòng, cập nhật nếu đã có — Admin không cần biết dòng đã tồn tại hay chưa. */
export async function upsertSeoSchema(
  entityType: SeoEntityType,
  entityId: string | null,
  schemaType: SeoSchemaType,
  payload: SeoSchemaFormValue,
): Promise<ManagedSeoSchema> {
  return adminApi.put<SeoSchemaDto>("/seo/schemas", { entityType, entityId, schemaType, ...payload });
}

/** Xóa dòng — schema quay lại được generate tự động. Không lỗi nếu chưa có dòng. */
export async function deleteSeoSchema(
  entityType: SeoEntityType,
  entityId: string | null,
  schemaType: SeoSchemaType,
): Promise<void> {
  await adminApi.delete("/seo/schemas", { params: keyParams(entityType, entityId, schemaType) });
}
