import { api } from "@/lib/http/api-client";

import type { SeoPayload } from "./seo.types";

export type SeoSource = {
  /**
   * Endpoint thật SAU NÀY khi Backend ASP.NET Core sẵn sàng, vd
   * "/products/banh-cuon-nhan-thit/seo". Chưa cần tồn tại thật hôm nay —
   * chỉ dùng khi NEXT_PUBLIC_API_URL được set.
   */
  endpoint: string;
  /**
   * MOCK CONTRACT — dựng SeoPayload từ service mock hiện có (localStorage),
   * mô phỏng đúng những gì endpoint thật ở trên sẽ trả về. Trả về null nếu
   * không tìm thấy (vd. slug không tồn tại) — nơi gọi tự xử lý thành trang 404.
   */
  mockResolver: () => Promise<SeoPayload | null>;
};

/**
 * Seam Mock ↔ Real duy nhất cho toàn bộ SEO metadata:
 * - Hôm nay (chưa set NEXT_PUBLIC_API_URL): luôn chạy mockResolver — không
 *   gọi HTTP thật vì chưa có backend.
 * - Khi Backend ASP.NET Core sẵn sàng: set NEXT_PUBLIC_API_URL, hàm này tự
 *   chuyển sang gọi `api.get(source.endpoint)` — generateMetadata() của
 *   từng page KHÔNG cần sửa gì, chỉ cần endpoint thật trả đúng SeoPayload.
 */
export async function resolveSeoPayload(source: SeoSource): Promise<SeoPayload | null> {
  const useRealApi = Boolean(process.env.NEXT_PUBLIC_API_URL);

  if (useRealApi) {
    return api.get<SeoPayload>(source.endpoint);
  }

  return source.mockResolver();
}
