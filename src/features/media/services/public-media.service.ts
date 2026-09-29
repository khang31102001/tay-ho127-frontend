import { fetchBackend } from "@/lib/http/backend-fetch";
import { isNextImageCompatibleUrl } from "@/lib/image-hosts";

import { SEED_MEDIA } from "../mocks/media.mock";
import type { ManagedMedia, MediaType } from "../types/media.types";

/**
 * Danh sách media ĐỂ HIỂN THỊ / CHỌN — dùng bởi trang Site (tra ảnh theo id)
 * và MediaPicker trong các Editor nội dung. Gộp 2 nguồn:
 *
 * 1. SEED_MEDIA (mock, id "media-...") — nội dung Site vẫn chạy mock
 *    (sản phẩm, bài viết, banner...) đang tham chiếu các id này. Xóa khi các
 *    domain nội dung chuyển sang Backend.
 * 2. Media đang hoạt động của Backend (GET /api/v1/media/public, không cần
 *    đăng nhập) — gồm cả media admin vừa thêm ở Thư viện Media.
 *
 * Backend lỗi/không kết nối được thì chỉ còn nguồn (1): Site không vỡ, chỉ
 * không thấy media mới. Quản lý (thêm/sửa/xóa) media: media-library.service.ts.
 */

/** PublicMediaResponse của Backend. */
type PublicMediaDto = {
  id: string;
  fileName: string;
  url: string;
  type: string;
  altText: string | null;
};

const PUBLIC_MEDIA_REVALIDATE_SECONDS = 60;

function toManagedMedia(dto: PublicMediaDto): ManagedMedia {
  return {
    id: dto.id,
    fileName: dto.fileName,
    url: dto.url,
    type: dto.type.toLowerCase() as MediaType,
    altText: dto.altText ?? undefined,
    // Endpoint công khai không trả dung lượng; chỉ media đang hoạt động được trả về.
    size: 0,
    status: "active",
  };
}

async function fetchBackendPublicMedia(): Promise<PublicMediaDto[]> {
  // Server Component gọi thẳng Backend (có cache); trình duyệt đi qua Route Handler công khai.
  const response =
    typeof window === "undefined"
      ? await fetchBackend("/media/public?pageSize=200", { next: { revalidate: PUBLIC_MEDIA_REVALIDATE_SECONDS } })
      : await fetch("/api/media/public");

  if (!response.ok) {
    throw new Error(`Public media: HTTP ${response.status}`);
  }

  return ((await response.json()) as { items: PublicMediaDto[] }).items;
}

/**
 * Ảnh có host chưa khai báo (NEXT_PUBLIC_IMAGE_REMOTE_HOSTS) bị loại: <Image />
 * của Site sẽ ném lỗi với host lạ — không để nó lọt vào MediaPicker/Site.
 */
function isUsableOnSite(media: ManagedMedia): boolean {
  return media.type !== "image" || isNextImageCompatibleUrl(media.url);
}

export async function listMedia(): Promise<ManagedMedia[]> {
  try {
    const backendMedia = (await fetchBackendPublicMedia()).map(toManagedMedia).filter(isUsableOnSite);
    return [...SEED_MEDIA, ...backendMedia];
  } catch (error) {
    console.error("Không tải được media từ Backend — chỉ dùng media mẫu:", error);
    return SEED_MEDIA;
  }
}
