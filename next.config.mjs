/**
 * Host ảnh được phép tối ưu qua <Image /> — cùng quy tắc với src/core/config/image-hosts.ts
 * (file .mjs không import được TS nên lặp lại ở đây, 2 nơi phải luôn khớp nhau):
 * domain của site (ảnh upload {site}/uploads/...) luôn được phép + host ngoài trong
 * NEXT_PUBLIC_IMAGE_REMOTE_HOSTS. Domain mặc định khớp site.following.web (site-data.ts);
 * `||` để build-arg rỗng trong CI vẫn rơi về mặc định (xem site-url.ts).
 */
const siteHost = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tayho127.com").hostname
  .toLowerCase()
  .replace(/^www\./, "");
const remoteImageHosts = [
  ...new Set([
    siteHost,
    `www.${siteHost}`,
    ...(process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cho phép Next tối ưu ảnh local (/public/images) và ảnh từ host đã khai báo.
    unoptimized: false,
    remotePatterns: remoteImageHosts.flatMap((hostname) => [
      { protocol: "https", hostname },
      { protocol: "http", hostname },
    ]),
  },
  // Route cũ /bai-viet đã gộp vào /tin-tuc — giữ link cũ (Google, bookmark, menu) không bị 404.
  async redirects() {
    return [
      { source: "/bai-viet", destination: "/tin-tuc", permanent: true },
      { source: "/bai-viet/:slug", destination: "/tin-tuc/:slug", permanent: true },
    ];
  },
  // Bật strict mode để phát hiện lỗi render trong quá trình phát triển.
  reactStrictMode: true,
  // Gói tối thiểu để chạy trong Docker (.next/standalone) — xem Dockerfile.
  output: "standalone",
};

export default nextConfig;
