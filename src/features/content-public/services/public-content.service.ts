import { fetchBackend } from "@/lib/http/backend-fetch";

import type {
  PublicArticle,
  PublicArticleSummary,
  PublicBanner,
  PublicPage,
  PublicTaxonomy,
} from "../types/public-content.types";
import { parsePublicArticle, parsePublicArticleList, parsePublicTaxonomy } from "../utils/parse-public-content";

/**
 * Nội dung đang công khai cho Customer Site — Backend GET /api/v1/content/public/*
 * (không cần đăng nhập, chỉ trả bài ĐÃ XUẤT BẢN). SERVER-ONLY: các hàm dưới chạy
 * trong Server Component/route (gọi thẳng Backend, cache 60 giây: Admin sửa → Site
 * thấy trong tối đa 60 giây). Quản lý (thêm/sửa/xóa) là việc của Admin:
 * features/articles|article-categories|article-tags.
 *
 * Backend lỗi/không kết nối được → danh sách rỗng / null (Site hiện "chưa có bài
 * viết"/404, không vỡ trang); lỗi được log. Bài nháp/lưu trữ KHÔNG xem được qua
 * URL công khai (trả null) — chỉ Admin thấy trong Editor.
 *
 * Response bài viết/taxonomy được kiểm tra hình dạng (utils/parse-public-content.ts) trước khi
 * dùng: JSON sai định dạng bị coi như Backend lỗi (cùng nhánh log + fallback ở trên) thay vì
 * vỡ lúc render.
 */
const PUBLIC_CONTENT_REVALIDATE_SECONDS = 60;

/** Backend giới hạn pageSize tối đa 200 (PagedRequest). */
const PUBLIC_ARTICLES_PAGE_SIZE = 200;

const EMPTY_TAXONOMY: PublicTaxonomy = { categories: [], tags: [] };

async function getJson<T>(path: string): Promise<T | null> {
  const response = await fetchBackend(path, { next: { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS } });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Public content ${path}: HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

/** Bài đã xuất bản, mới nhất trước (không kèm nội dung HTML). */
export async function listPublishedArticles(): Promise<PublicArticleSummary[]> {
  try {
    const page = await getJson<unknown>(`/content/public/articles?pageSize=${PUBLIC_ARTICLES_PAGE_SIZE}`);
    return page === null ? [] : parsePublicArticleList(page);
  } catch (error) {
    console.error("Không tải được danh sách bài viết từ Backend:", error);
    return [];
  }
}

/** Bài đã xuất bản theo slug; null nếu không có hoặc chưa xuất bản. */
export async function getPublishedArticleBySlug(slug: string): Promise<PublicArticle | null> {
  try {
    const article = await getJson<unknown>(`/content/public/articles/${encodeURIComponent(slug)}`);
    return article === null ? null : parsePublicArticle(article);
  } catch (error) {
    console.error("Không tải được bài viết từ Backend:", error);
    return null;
  }
}

/** Danh mục đang hoạt động (theo thứ tự) và toàn bộ thẻ — bộ lọc của trang bài viết. */
export async function getPublicTaxonomy(): Promise<PublicTaxonomy> {
  try {
    const taxonomy = await getJson<unknown>("/content/public/taxonomy");
    return taxonomy === null ? EMPTY_TAXONOMY : parsePublicTaxonomy(taxonomy);
  } catch (error) {
    console.error("Không tải được danh mục/thẻ bài viết từ Backend:", error);
    return EMPTY_TAXONOMY;
  }
}

/** Banner đang chạy của 1 vị trí (HOME_HERO | HOME_PROMOTION | MENU_HERO | ARTICLE_BANNER), theo thứ tự hiển thị. */
export async function listActiveBanners(placement: string): Promise<PublicBanner[]> {
  try {
    return (await getJson<PublicBanner[]>(`/content/public/banners?placement=${encodeURIComponent(placement)}`)) ?? [];
  } catch (error) {
    console.error("Không tải được banner từ Backend:", error);
    return [];
  }
}

/**
 * Page đã xuất bản (id, tên, đường dẫn). KHÁC các hàm còn lại trong file: chạy được cả ở server (gọi thẳng
 * Backend) lẫn trình duyệt (qua route công khai app/api/content/public/pages) vì Navigation (header/footer)
 * tải lại menu ở phía trình duyệt để thấy thay đổi vừa lưu.
 */
export async function listPublishedPages(): Promise<PublicPage[]> {
  try {
    const response =
      typeof window === "undefined"
        ? await fetchBackend("/content/public/pages", { next: { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS } })
        : await fetch("/api/content/public/pages");

    if (!response.ok) {
      throw new Error(`Public pages: HTTP ${response.status}`);
    }

    return (await response.json()) as PublicPage[];
  } catch (error) {
    console.error("Không tải được danh sách page từ Backend:", error);
    return [];
  }
}
