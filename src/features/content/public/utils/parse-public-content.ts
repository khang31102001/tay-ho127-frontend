import type {
  PublicArticle,
  PublicArticleSummary,
  PublicPageSection,
  PublicPageSectionItem,
  PublicTaxonomy,
} from "../types/public-content.types";

/**
 * Kiểm tra hình dạng JSON Backend trả về trước khi đưa vào Site: response chỉ được ÉP KIỂU
 * thì dữ liệu sai (Backend bản cũ, thiếu field...) sẽ vỡ ở lúc render (vd. `tagIds.map`) → 500.
 * Sai thì ném lỗi để nơi gọi (đã có try/catch) log và trả null / rỗng.
 */
type Raw = Record<string, unknown>;

function asObject(value: unknown, what: string): Raw {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${what}: không phải object`);
  }
  return value as Raw;
}

function str(raw: Raw, key: string, what: string): string {
  const value = raw[key];
  if (typeof value !== "string") {
    throw new Error(`${what}: field "${key}" thiếu hoặc không phải chuỗi`);
  }
  return value;
}

function strOrNull(raw: Raw, key: string): string | null {
  const value = raw[key];
  return typeof value === "string" ? value : null;
}

function strArray(raw: Raw, key: string): string[] {
  const value = raw[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseSummaryFields(raw: Raw, what: string): PublicArticleSummary {
  const readingTime = raw.readingTimeMinutes;
  const featuredOrder = raw.featuredOrder;

  return {
    id: str(raw, "id", what),
    slug: str(raw, "slug", what),
    title: str(raw, "title", what),
    summary: strOrNull(raw, "summary") ?? "",
    featuredMediaId: strOrNull(raw, "featuredMediaId"),
    categoryId: strOrNull(raw, "categoryId"),
    tagIds: strArray(raw, "tagIds"),
    authorName: strOrNull(raw, "authorName") ?? "",
    publishedAt: str(raw, "publishedAt", what),
    updatedAt: strOrNull(raw, "updatedAt") ?? str(raw, "publishedAt", what),
    readingTimeMinutes: typeof readingTime === "number" ? readingTime : 1,
    // Backend bản cũ chưa có 2 field này → coi như không có bài nổi bật, không làm hỏng danh sách.
    isFeatured: raw.isFeatured === true,
    featuredOrder: typeof featuredOrder === "number" ? featuredOrder : null,
  };
}

export function parsePublicArticle(data: unknown): PublicArticle {
  const raw = asObject(data, "Bài viết");
  return { ...parseSummaryFields(raw, "Bài viết"), content: strOrNull(raw, "content") ?? "" };
}

/** Danh sách bài: bỏ qua từng bài hỏng (log) thay vì làm hỏng cả danh sách. */
export function parsePublicArticleList(data: unknown): PublicArticleSummary[] {
  const items = asObject(data, "Danh sách bài viết").items;
  if (!Array.isArray(items)) {
    throw new Error('Danh sách bài viết: field "items" không phải mảng');
  }

  return items.flatMap((item, index) => {
    try {
      return [parseSummaryFields(asObject(item, `Bài viết #${index}`), `Bài viết #${index}`)];
    } catch (error) {
      console.error("Bỏ qua bài viết sai định dạng từ Backend:", error);
      return [];
    }
  });
}

/** Dòng của section dạng danh sách; Backend cũ (chưa có `items`) → rỗng, dòng không phải object bị bỏ qua. */
function parseSectionItems(value: unknown): PublicPageSectionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return [];
    }

    const raw = item as Raw;
    return [
      {
        label: strOrNull(raw, "label"),
        title: strOrNull(raw, "title"),
        text: strOrNull(raw, "text"),
        mediaId: strOrNull(raw, "mediaId"),
        url: strOrNull(raw, "url"),
      },
    ];
  });
}

/** Danh sách section của page: bỏ qua từng section hỏng (log) thay vì làm hỏng cả trang. */
export function parsePublicPageSectionList(data: unknown): PublicPageSection[] {
  if (!Array.isArray(data)) {
    throw new Error("Danh sách section: không phải mảng");
  }

  return data.flatMap((item, index) => {
    const what = `Section #${index}`;
    try {
      const raw = asObject(item, what);
      const settings = typeof raw.settings === "object" && raw.settings !== null ? (raw.settings as Raw) : {};
      const displayOrder = raw.displayOrder;

      return [
        {
          id: str(raw, "id", what),
          sectionKey: strOrNull(raw, "sectionKey"),
          sectionKind: str(raw, "sectionKind", what),
          eyebrow: strOrNull(raw, "eyebrow"),
          heading: strOrNull(raw, "heading"),
          subheading: strOrNull(raw, "subheading"),
          body: strOrNull(raw, "body"),
          mediaId: strOrNull(raw, "mediaId"),
          ctaLabel: strOrNull(raw, "ctaLabel"),
          ctaUrl: strOrNull(raw, "ctaUrl"),
          displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
          galleryMediaIds: strArray(settings, "galleryMediaIds"),
          items: parseSectionItems(settings.items),
        },
      ];
    } catch (error) {
      console.error("Bỏ qua section sai định dạng từ Backend:", error);
      return [];
    }
  });
}

function parseNamed<T extends { id: string; name: string; slug: string }>(item: unknown, what: string, extra: (raw: Raw) => Omit<T, "id" | "name" | "slug">): T {
  const raw = asObject(item, what);
  return { id: str(raw, "id", what), name: str(raw, "name", what), slug: str(raw, "slug", what), ...extra(raw) } as T;
}

export function parsePublicTaxonomy(data: unknown): PublicTaxonomy {
  const raw = asObject(data, "Taxonomy");
  if (!Array.isArray(raw.categories) || !Array.isArray(raw.tags)) {
    throw new Error('Taxonomy: "categories"/"tags" không phải mảng');
  }

  return {
    categories: raw.categories.map((item) =>
      parseNamed<PublicTaxonomy["categories"][number]>(item, "Danh mục", (r) => ({
        parentId: strOrNull(r, "parentId"),
        sortOrder: typeof r.sortOrder === "number" ? r.sortOrder : 0,
      })),
    ),
    tags: raw.tags.map((item) => parseNamed<PublicTaxonomy["tags"][number]>(item, "Thẻ", () => ({}))),
  };
}
