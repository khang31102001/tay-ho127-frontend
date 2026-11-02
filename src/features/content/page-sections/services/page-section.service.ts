import { adminApi } from "@/core/api/admin-api";

import {
  GALLERY_SECTION_TYPES,
  LIST_SECTION_TYPES,
  type ManagedPageSection,
  type SectionType,
} from "../types/page-section.types";

/**
 * Admin → Content → Page → Section, gọi Backend /api/v1/content/pages/{pageId}/sections (quyền pages.*).
 * Mọi thao tác đi qua page chứa section: section không thuộc page đó → 404.
 *
 * - `body` là văn bản THUẦN (không phải HTML).
 * - `ctaUrl` chỉ nhận đường dẫn trong site ("/thuc-don") hoặc URL http(s) — scheme khác Backend trả 400.
 * - Backend gọi loại section là `sectionKind`; FE giữ tên `sectionType` ở model.
 * - Ảnh phụ (`galleryMediaIds`, tối đa 6) và dòng danh sách (`items`, tối đa 20, chỉ stats/timeline/faq) nằm trong
 *   `settings` jsonb của Backend.
 * - `sectionKey` duy nhất trong 1 page — trùng thì Backend trả 409.
 */

/** PageSectionResponse của Backend. */
type PageSectionItemDto = {
  label: string | null;
  title: string | null;
  text: string | null;
  mediaId: string | null;
  url: string | null;
};

type PageSectionDto = {
  id: string;
  pageId: string;
  sectionKey?: string | null;
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
  settings: { galleryMediaIds: string[]; items?: PageSectionItemDto[] } | null;
};

export type PageSectionUpsertInput = Omit<ManagedPageSection, "id">;

function toManagedPageSection(dto: PageSectionDto): ManagedPageSection {
  return {
    id: dto.id,
    pageId: dto.pageId,
    sectionKey: dto.sectionKey ?? null,
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
    galleryMediaIds: dto.settings?.galleryMediaIds ?? [],
    items: (dto.settings?.items ?? []).map((item) => ({
      label: item.label ?? "",
      title: item.title ?? "",
      text: item.text ?? "",
      mediaId: item.mediaId,
      url: item.url ?? "",
    })),
  };
}

/** Chỉ gửi phần settings mà loại section dùng (đổi loại thì phần cũ không bị lưu sót); dòng trống Backend bỏ qua. */
function toSettingsRequest(payload: PageSectionUpsertInput) {
  const galleryMediaIds = GALLERY_SECTION_TYPES.includes(payload.sectionType) ? payload.galleryMediaIds : [];
  const items = LIST_SECTION_TYPES.includes(payload.sectionType) ? payload.items : [];

  if (galleryMediaIds.length === 0 && items.length === 0) {
    return null;
  }

  return {
    galleryMediaIds,
    items: items.map((item) => ({
      label: item.label || null,
      title: item.title || null,
      text: item.text || null,
      mediaId: item.mediaId,
      url: item.url || null,
    })),
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
    // PUT thay toàn bộ section: không gửi settings = xóa ảnh phụ / danh sách.
    settings: toSettingsRequest(payload),
    sectionKey: payload.sectionKey || null,
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

/** Lưu thứ tự mới: `sectionIds` = MỌI section của page, đầu → cuối (Backend đánh lại 10, 20, 30...). */
export async function reorderSections(pageId: string, sectionIds: string[]): Promise<ManagedPageSection[]> {
  return (await adminApi.put<PageSectionDto[]>(`${sectionsPath(pageId)}/order`, { sectionIds })).map(toManagedPageSection);
}

export function deleteSection(pageId: string, id: string): Promise<void> {
  return adminApi.delete<void>(`${sectionsPath(pageId)}/${id}`);
}
