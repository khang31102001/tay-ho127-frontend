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
  // Bật strict mode để phát hiện lỗi render trong quá trình phát triển.
  reactStrictMode: true,
};

export default nextConfig;
