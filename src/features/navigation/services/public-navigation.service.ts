import { listPublishedPages } from "@/features/content-public";
import { fetchBackend } from "@/lib/http/backend-fetch";

import type { NavigationItem, NavigationLocation, NavigationTargetType } from "../types/navigation.types";

/**
 * Menu Website (header / footer / mobile) cho khách — Backend GET /api/v1/navigation/public/{location} (không cần
 * đăng nhập, chỉ trả mục đang bật và công khai). SERVER-ONLY: chạy trong Server Component (gọi thẳng Backend, cache
 * 60 giây: Admin sửa menu → Site thấy trong tối đa 60 giây). Backend lỗi/không kết nối được → danh sách rỗng (Site
 * vẫn hiện, chỉ thiếu menu); lỗi được log.
 */
const PUBLIC_NAVIGATION_REVALIDATE_SECONDS = 60;

type PublicNavigationNodeDto = {
  id: string;
  label: string;
  url: string | null;
  targetType: NavigationTargetType | null;
  targetId: string | null;
  openInNewTab: boolean;
  icon: string | null;
  sortOrder: number;
  children: PublicNavigationNodeDto[];
};

type PublicNavigationDto = { items: PublicNavigationNodeDto[] };

function hasPageTarget(nodes: PublicNavigationNodeDto[]): boolean {
  return nodes.some((node) => (node.targetType === "page" && node.targetId !== null) || hasPageTarget(node.children));
}

/**
 * targetType "page" lấy đường dẫn thật từ Page CMS ĐÃ XUẤT BẢN (chỉ đường dẫn, không copy nội dung); page không
 * tồn tại/chưa xuất bản thì dùng `url` lưu trên item.
 */
function toNavigationItems(nodes: PublicNavigationNodeDto[], pathByPageId: Map<string, string>): NavigationItem[] {
  return nodes.map((node) => ({
    id: node.id,
    label: node.label,
    targetType: node.targetType,
    targetId: node.targetId,
    url:
      node.targetType === "page" && node.targetId ? (pathByPageId.get(node.targetId) ?? node.url) : node.url,
    icon: node.icon,
    sortOrder: node.sortOrder,
    openInNewTab: node.openInNewTab,
    children: toNavigationItems(node.children, pathByPageId),
  }));
}

export async function getPublicNavigation(location: NavigationLocation): Promise<NavigationItem[]> {
  try {
    const response = await fetchBackend(`/navigation/public/${location}`, {
      next: { revalidate: PUBLIC_NAVIGATION_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`Public navigation ${location}: HTTP ${response.status}`);
    }

    const menu = (await response.json()) as PublicNavigationDto;

    // Chỉ gọi Backend lấy danh sách page khi có mục trỏ tới page — và đúng 1 lần cho cả menu.
    const pathByPageId = new Map<string, string>();
    if (hasPageTarget(menu.items)) {
      (await listPublishedPages()).forEach((page) => pathByPageId.set(page.id, page.slug));
    }

    return toNavigationItems(menu.items, pathByPageId);
  } catch (error) {
    console.error(`Không tải được menu ${location} từ Backend:`, error);
    return [];
  }
}
