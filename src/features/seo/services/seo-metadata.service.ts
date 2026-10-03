import { ADMIN_LIST_PAGE_SIZE, adminApi } from "@/lib/http/admin-api";
import { isApiError } from "@/lib/http/api-error";
import type { PaginatedResult } from "@/lib/http/api-types";

import type { ManagedSeoMetadata, SeoEntityType, SeoMetadataFormValue } from "../types/seo-metadata.types";

/**
 * Admin → SEO → Metadata, gọi Backend /api/v1/seo/metadata (quyền seo-metadata.view|update|delete).
 * Site đọc cùng dữ liệu này qua seo-public.service.ts (server-only), không qua file này.
 *
 * Mỗi entity có tối đa 1 override, định danh theo CẶP (entityType, entityId) — không theo id riêng của override.
 * `entityId` là id của entity trên Site: Product/Category/Article/Page dùng id (Guid) của Backend, KHÔNG dùng slug
 * (đổi slug không làm mất override); "homepage" là singleton nên không có entityId (null).
 * Backend trả 400 khi entityType lạ, thiếu entityId (trừ homepage), hoặc canonicalUrl không phải đường dẫn trong site / URL http(s).
 */

/** SeoMetadataResponse của Backend — khớp ManagedSeoMetadata 1:1. */
type SeoMetadataDto = ManagedSeoMetadata;

function entityParams(entityType: SeoEntityType, entityId: string | null) {
  return { entityType, entityId };
}

export async function listSeoMetadata(): Promise<ManagedSeoMetadata[]> {
  const page = await adminApi.get<PaginatedResult<SeoMetadataDto>>("/seo/metadata", {
    params: { pageSize: ADMIN_LIST_PAGE_SIZE },
  });
  return page.items;
}

/** null khi entity chưa có override (Backend 404) — entity dùng Entity Default + SEO Settings. */
export async function getSeoMetadata(
  entityType: SeoEntityType,
  entityId: string | null,
): Promise<ManagedSeoMetadata | null> {
  try {
    return await adminApi.get<SeoMetadataDto>("/seo/metadata/lookup", { params: entityParams(entityType, entityId) });
  } catch (error) {
    if (isApiError(error) && error.kind === "not_found") {
      return null;
    }
    throw error;
  }
}

/**
 * Upsert theo (entityType, entityId) — tạo mới nếu chưa có override, cập nhật nếu đã có. Không có hàm
 * create/update riêng vì Admin không cần biết override đã tồn tại hay chưa trước khi lưu.
 */
export async function upsertSeoMetadata(
  entityType: SeoEntityType,
  entityId: string | null,
  payload: SeoMetadataFormValue,
): Promise<ManagedSeoMetadata> {
  return adminApi.put<SeoMetadataDto>("/seo/metadata", { entityType, entityId, ...payload });
}

/** Reset override — entity quay lại dùng Entity Default + SEO Settings hoàn toàn. Không lỗi nếu chưa có override. */
export async function resetSeoMetadata(entityType: SeoEntityType, entityId: string | null): Promise<void> {
  await adminApi.delete("/seo/metadata", { params: entityParams(entityType, entityId) });
}
