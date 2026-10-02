import type { ManagedSeoMetadata, SeoEntityType, SeoMetadataFormValue } from "../types/seo-metadata.types";
import { SEED_SEO_METADATA } from "../mocks/seo-metadata.mock";

/**
 * MOCK CONTRACT: chưa có backend SEO thật. Dữ liệu seed (xem
 * ../mocks/seo-metadata.mock.ts) + đồng bộ 2 chiều với localStorage — đúng
 * pattern mọi feature admin CRUD khác. Khi có Backend ASP.NET Core thật, chỉ
 * cần thay nội dung các hàm dưới đây bằng gọi `api.get/put/delete("/api/seo/...")`
 * (xem seo-architecture-analysis.md mục 5) — nơi gọi (hooks/useSeoEditor.ts,
 * Product/Category/ArticleEditor) không cần sửa gì.
 *
 * Khoá theo CẶP (entityType, entityId) thay vì id đơn — 1 entity chỉ có tối
 * đa 1 override, giống ràng buộc unique (entity_type, entity_id) đã thiết kế
 * trong database_tayho.dbml.
 */
const STORAGE_KEY = "tayho-admin-seo-metadata";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedSeoMetadata[] {
  if (typeof window === "undefined") {
    return SEED_SEO_METADATA;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedSeoMetadata[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu SEO metadata:", error);
  }

  return SEED_SEO_METADATA;
}

function writeStore(rows: ManagedSeoMetadata[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (error) {
    console.error("Không thể lưu dữ liệu SEO metadata:", error);
  }
}

function matchesEntity(row: ManagedSeoMetadata, entityType: SeoEntityType, entityId: string | null): boolean {
  return row.entityType === entityType && row.entityId === entityId;
}

export async function listSeoMetadata(): Promise<ManagedSeoMetadata[]> {
  await delay();
  return readStore();
}

export async function getSeoMetadata(
  entityType: SeoEntityType,
  entityId: string | null,
): Promise<ManagedSeoMetadata | null> {
  await delay();
  return readStore().find((row) => matchesEntity(row, entityType, entityId)) ?? null;
}

/**
 * Upsert theo (entityType, entityId) — tạo mới nếu chưa có override, cập
 * nhật nếu đã có. Không có hàm create/update riêng vì Admin không cần biết
 * (và không nên quan tâm) override đã tồn tại hay chưa trước khi lưu.
 */
export async function upsertSeoMetadata(
  entityType: SeoEntityType,
  entityId: string | null,
  payload: SeoMetadataFormValue,
): Promise<ManagedSeoMetadata> {
  await delay();

  const now = new Date().toISOString();
  const current = readStore();
  const existing = current.find((row) => matchesEntity(row, entityType, entityId));

  const saved: ManagedSeoMetadata = {
    id: existing?.id ?? `seo-meta-${Date.now()}`,
    entityType,
    entityId,
    ...payload,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  writeStore(
    existing
      ? current.map((row) => (matchesEntity(row, entityType, entityId) ? saved : row))
      : [...current, saved],
  );

  return saved;
}

/** Reset override — entity quay lại dùng Entity Default + SEO Settings hoàn toàn. */
export async function resetSeoMetadata(entityType: SeoEntityType, entityId: string | null): Promise<void> {
  await delay();

  writeStore(readStore().filter((row) => !matchesEntity(row, entityType, entityId)));
}
