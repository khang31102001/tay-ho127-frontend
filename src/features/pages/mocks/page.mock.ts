import type { ManagedPage } from "../types/page.types";

/**
 * MOCK CONTRACT: seed tối thiểu cho Phase 02 (Page Management). "Trang chủ"
 * và "Thực đơn" ứng với 2 route đã tồn tại trên Site (chưa nối dữ liệu ở
 * Phase này — xem Phase 07 trong kế hoạch CMS). "Liên hệ" là ví dụ landing
 * page ở trạng thái nháp để minh họa luồng publish.
 */
export const SEED_PAGES: ManagedPage[] = [
  {
    id: "page-home",
    name: "Trang chủ",
    slug: "/",
    status: "published",
    publishedAt: "2026-01-05T00:00:00.000Z",
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "page-thuc-don",
    name: "Thực đơn",
    slug: "/thuc-don",
    status: "published",
    publishedAt: "2026-01-05T00:00:00.000Z",
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "page-lien-he",
    name: "Liên hệ",
    slug: "/lien-he",
    status: "draft",
    publishedAt: null,
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
  },
];
