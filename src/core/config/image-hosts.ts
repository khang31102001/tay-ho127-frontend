import { getSiteUrl } from "./site-url";

/**
 * Host ảnh mà <Image /> của Next.js được phép tối ưu:
 * - Domain của chính site (getSiteUrl(), kèm bản có/không "www.") — LUÔN được phép, vì file upload
 *   của Thư viện Media nằm ở {site}/uploads/...; không phụ thuộc biến build để ảnh upload khỏi
 *   "biến mất" khi CI quên truyền biến.
 * - Thêm các host ngoài (CDN) trong NEXT_PUBLIC_IMAGE_REMOTE_HOSTS (phân cách dấu phẩy, vd.
 *   "cdn.tayho127.vn,res.cloudinary.com").
 * next.config.mjs dựng images.remotePatterns theo CÙNG quy tắc — sửa ở đây thì sửa cả bên đó.
 *
 * <Image /> ném lỗi khi gặp host chưa khai báo, nên URL ảnh đưa vào Site phải
 * qua isNextImageCompatibleUrl() trước (xem features/media/public-media.service).
 */
export function getAllowedImageHosts(): string[] {
  const siteHost = new URL(getSiteUrl()).hostname.toLowerCase().replace(/^www\./, "");
  const remoteHosts = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set([siteHost, `www.${siteHost}`, ...remoteHosts])];
}

/** Ảnh nội bộ (/public) hoặc thuộc host đã khai báo => dùng được với <Image /> tối ưu. */
export function isNextImageCompatibleUrl(url: string): boolean {
  if (url.startsWith("/")) {
    return true;
  }

  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === "https:" || protocol === "http:") && getAllowedImageHosts().includes(hostname.toLowerCase());
  } catch {
    return false;
  }
}
