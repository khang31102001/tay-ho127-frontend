import { adminApi } from "@/lib/http/admin-api";

import type { ManagedPageSection, SectionType } from "../types/page-section.types";

/**
 * Admin → Content → Page → Section, gọi Backend /api/v1/content/pages/{pageId}/sections (quyền pages.*).
 * Mọi thao tác đi qua page chứa section: section không thuộc page đó → 404.
 *
 * - `body` là văn bản THUẦN (không phải HTML).
 * - `ctaUrl` chỉ nhận đường dẫn trong site ("/thuc-don") hoặc URL http(s) — scheme khác Backend trả 400.
 * - Backend gọi loại section là `sectionKind`; FE giữ tên `sectionType` ở model.
 */

/** PageSectionResponse của Backend. */
type PageSectionDto = {
  id: string;
  pageId: string;
  sectionKind: SectionType;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  mediaId: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
};

export type PageSectionUpsertInput = Omit<ManagedPageSection, "id">;

function toManagedPageSection(dto: PageSectionDto): ManagedPageSection {
  return {
    id: dto.id,
    pageId: dto.pageId,
    sectionType: dto.sectionKind,
    eyebrow: dto.eyebrow ?? undefined,
    heading: dto.heading ?? undefined,
    subheading: dto.subheading ?? undefined,
    body: dto.body ?? undefined,
    mediaId: dto.mediaId,
    ctaLabel: dto.ctaLabel ?? undefined,
    ctaUrl: dto.ctaUrl ?? undefined,
    displayOrder: dto.displayOrder,
    isVisible: dto.isVisible,
  };
}

function toRequest(payload: PageSectionUpsertInput) {
  return {
    sectionKind: payload.sectionType,
    eyebrow: payload.eyebrow || null,
    heading: payload.heading || null,
    subheading: payload.subheading || null,
    body: payload.body || null,
    mediaId: payload.mediaId ?? null,
    ctaLabel: payload.ctaLabel || null,
    ctaUrl: payload.ctaUrl || null,
    displayOrder: payload.displayOrder,
    isVisible: payload.isVisible,
  };
}

const sectionsPath = (pageId: string) => `/content/pages/${pageId}/sections`;

/** Mọi section của page, đã sắp theo displayOrder. */
export async function listSectionsByPageId(pageId: string): Promise<ManagedPageSection[]> {
  return (await adminApi.get<PageSectionDto[]>(sectionsPath(pageId))).map(toManagedPageSection);
}

export async function getSectionById(pageId: string, id: string): Promise<ManagedPageSection> {
  return toManagedPageSection(await adminApi.get<PageSectionDto>(`${sectionsPath(pageId)}/${id}`));
}

export async function createSection(payload: PageSectionUpsertInput): Promise<ManagedPageSection> {
  return toManagedPageSection(await adminApi.post<PageSectionDto>(sectionsPath(payload.pageId), toRequest(payload)));
}

export async function updateSection(id: string, payload: PageSectionUpsertInput): Promise<ManagedPageSection> {
  return toManagedPageSection(
    await adminApi.put<PageSectionDto>(`${sectionsPath(payload.pageId)}/${id}`, toRequest(payload)),
  );
}

export function deleteSection(pageId: string, id: string): Promise<void> {
  return adminApi.delete<void>(`${sectionsPath(pageId)}/${id}`);
}
