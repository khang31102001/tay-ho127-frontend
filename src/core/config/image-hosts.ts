/**
 * Host ảnh ngoài mà <Image /> của Next.js được phép tối ưu — đọc từ
 * NEXT_PUBLIC_IMAGE_REMOTE_HOSTS (danh sách phân cách dấu phẩy, vd.
 * "cdn.tayho127.vn,res.cloudinary.com"). next.config.mjs dựng
 * images.remotePatterns từ CÙNG biến này — 2 nơi luôn khớp nhau.
 *
 * <Image /> ném lỗi khi gặp host chưa khai báo, nên URL ảnh đưa vào Site phải
 * qua isNextImageCompatibleUrl() trước (xem features/media/public-media.service).
 */
export function getAllowedImageHosts(): string[] {
  return (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
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
