/**
 * Pure generator functions — nhận business data làm input, trả về object
 * JSON-LD thuần (KHÔNG gọi service/API). Task 8: ưu tiên derive từ dữ liệu
 * thật (Product/Article/BrandSettings) thay vì lưu lại field trùng lặp.
 * `undefined` bị JSON.stringify tự loại bỏ nên không cần dọn tay.
 */

export type JsonLdObject = Record<string, unknown>;

type OrganizationInput = {
  name: string;
  url: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  sameAs: string[];
};

export function buildOrganizationSchema(input: OrganizationInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: input.url,
    logo: input.logoUrl || undefined,
    telephone: input.phone || undefined,
    email: input.email || undefined,
    sameAs: input.sameAs.length > 0 ? input.sameAs : undefined,
  };
}

type RestaurantInput = {
  name: string;
  url: string;
  imageUrl?: string;
  phone?: string;
  streetAddress: string;
  addressLocality?: string;
  addressRegion?: string;
  openTime: string;
  closeTime: string;
};

/** Task 6: "Restaurant / FoodEstablishment" — dùng @type Restaurant (subtype hợp lệ của FoodEstablishment trong schema.org). */
export function buildRestaurantSchema(input: RestaurantInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: input.name,
    url: input.url,
    image: input.imageUrl || undefined,
    telephone: input.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: input.streetAddress,
      addressLocality: input.addressLocality || undefined,
      addressRegion: input.addressRegion || undefined,
      addressCountry: "VN",
    },
    // Chỉ khai báo giờ mở cửa khi Admin đã nhập — không bịa giờ mặc định vào dữ liệu có cấu trúc.
    ...(input.openTime && input.closeTime
      ? {
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: input.openTime,
            closes: input.closeTime,
          },
        }
      : {}),
  };
}

export function buildWebSiteSchema(siteUrl: string, siteName: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };
}

type ProductInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  url: string;
  /** Không có trên ManagedProduct hôm nay — chỉ điền khi Admin override qua SeoSchema.config (Task 7/8). */
  sku?: string;
  brand?: string;
};

/** Task 20: Product Schema + Offer lồng bên trong (đúng convention schema.org, không tách Offer thành @type riêng ở top-level). */
export function buildProductSchema(input: ProductInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description || undefined,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    sku: input.sku || undefined,
    brand: input.brand ? { "@type": "Brand", name: input.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: input.url,
      priceCurrency: "VND",
      price: input.price,
      availability: "https://schema.org/InStock",
    },
  };
}

export type BreadcrumbItem = {
  name: string;
  /** Đường dẫn tương đối bắt đầu bằng "/" — hàm tự ghép với siteUrl. */
  path: string;
};

export function buildBreadcrumbListSchema(siteUrl: string, items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

type ArticleInput = {
  headline: string;
  description?: string;
  imageUrl?: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName: string;
  publisherName: string;
  publisherLogoUrl?: string;
};

/** Task 6/22: "Article / BlogPosting" — dùng @type Article (đủ cho bài viết/tin tức, không cần phân biệt BlogPosting riêng). */
export function buildArticleSchema(input: ArticleInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description || undefined,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? input.datePublished ?? undefined,
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: input.publisherName,
      logo: input.publisherLogoUrl ? { "@type": "ImageObject", url: input.publisherLogoUrl } : undefined,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
  };
}
