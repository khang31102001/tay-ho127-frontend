/**
 * Host ảnh ngoài (CDN của Media Backend) được phép tối ưu qua <Image /> — cùng
 * biến với src/lib/image-hosts.ts, để 2 nơi luôn khớp nhau.
 */
const remoteImageHosts = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

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
  // jsdom (do isomorphic-dompurify kéo vào, dùng ở sanitizeHtml cho trang chi tiết tin tức)
  // đọc file tài nguyên của chính nó lúc chạy: bundle vào server chunk thì production
  // (Vercel) lỗi 500, nên phải giữ ở dạng package ngoài.
  experimental: {
    serverComponentsExternalPackages: ["isomorphic-dompurify", "jsdom"],
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
};

export default nextConfig;
