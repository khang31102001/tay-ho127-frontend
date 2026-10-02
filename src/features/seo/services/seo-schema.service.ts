import type { ManagedSeoSchema, SeoSchemaFormValue, SeoSchemaType } from "../types/seo-schema.types";
import type { SeoEntityType } from "../types/seo-metadata.types";
import { SEED_SEO_SCHEMA } from "../mocks/seo-schema.mock";

/**
 * MOCK CONTRACT — cùng pattern seo-metadata.service.ts. Khoá theo BỘ BA
 * (entityType, entityId, schemaType) — 1 entity có thể có nhiều schema override
 * khác nhau (vd. Product vừa có override "Product" vừa có thể có override
 * "FAQPage" sau này), khác seo_metadata chỉ có 1 override/entity.
 */
const STORAGE_KEY = "tayho-admin-seo-schema";
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore(): ManagedSeoSchema[] {
  if (typeof window === "undefined") {
    return SEED_SEO_SCHEMA;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as ManagedSeoSchema[];
      }
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu SEO schema:", error);
  }

  return SEED_SEO_SCHEMA;
}

function writeStore(rows: ManagedSeoSchema[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (error) {
    console.error("Không thể lưu dữ liệu SEO schema:", error);
  }
}

function matches(row: ManagedSeoSchema, entityType: SeoEntityType, entityId: string | null, schemaType: SeoSchemaType): boolean {
  return row.entityType === entityType && row.entityId === entityId && row.schemaType === schemaType;
}

export async function listSeoSchemaByEntity(
  entityType: SeoEntityType,
  entityId: string | null,
): Promise<ManagedSeoSchema[]> {
  await delay();
  return readStore().filter((row) => row.entityType === entityType && row.entityId === entityId);
}

export async function getSeoSchema(
  entityType: SeoEntityType,
  entityId: string | null,
  schemaType: SeoSchemaType,
): Promise<ManagedSeoSchema | null> {
  await delay();
  return readStore().find((row) => matches(row, entityType, entityId, schemaType)) ?? null;
}

export async function upsertSeoSchema(
  entityType: SeoEntityType,
  entityId: string | null,
  schemaType: SeoSchemaType,
  payload: SeoSchemaFormValue,
): Promise<ManagedSeoSchema> {
  await delay();

  const now = new Date().toISOString();
  const current = readStore();
  const existing = current.find((row) => matches(row, entityType, entityId, schemaType));

  const saved: ManagedSeoSchema = {
    id: existing?.id ?? `seo-schema-${Date.now()}`,
    entityType,
    entityId,
    schemaType,
    ...payload,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  writeStore(
    existing
      ? current.map((row) => (matches(row, entityType, entityId, schemaType) ? saved : row))
      : [...current, saved],
  );

  return saved;
}

export async function deleteSeoSchema(
  entityType: SeoEntityType,
  entityId: string | null,
  schemaType: SeoSchemaType,
): Promise<void> {
  await delay();

  writeStore(readStore().filter((row) => !matches(row, entityType, entityId, schemaType)));
}
