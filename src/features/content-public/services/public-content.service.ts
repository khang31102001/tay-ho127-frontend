import { fetchBackend } from "@/lib/http/backend-fetch";

import type {
  PublicArticle,
  PublicArticleSummary,
  PublicTaxonomy,
} from "../types/public-content.types";

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
 */
const PUBLIC_CONTENT_REVALIDATE_SECONDS = 60;

/** Backend giới hạn pageSize tối đa 200 (PagedRequest). */
const PUBLIC_ARTICLES_PAGE_SIZE = 200;

type PagedDto<T> = { items: T[] };

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
    const page = await getJson<PagedDto<PublicArticleSummary>>(
      `/content/public/articles?pageSize=${PUBLIC_ARTICLES_PAGE_SIZE}`,
    );
    return page?.items ?? [];
  } catch (error) {
    console.error("Không tải được danh sách bài viết từ Backend:", error);
    return [];
  }
}

/** Bài đã xuất bản theo slug; null nếu không có hoặc chưa xuất bản. */
export async function getPublishedArticleBySlug(slug: string): Promise<PublicArticle | null> {
  try {
    return await getJson<PublicArticle>(`/content/public/articles/${encodeURIComponent(slug)}`);
  } catch (error) {
    console.error("Không tải được bài viết từ Backend:", error);
    return null;
  }
}

/** Danh mục đang hoạt động (theo thứ tự) và toàn bộ thẻ — bộ lọc của trang bài viết. */
export async function getPublicTaxonomy(): Promise<PublicTaxonomy> {
  try {
    return (await getJson<PublicTaxonomy>("/content/public/taxonomy")) ?? EMPTY_TAXONOMY;
  } catch (error) {
    console.error("Không tải được danh mục/thẻ bài viết từ Backend:", error);
    return EMPTY_TAXONOMY;
  }
}
