import { LoadingOverlay } from "@/components/shared/LoadingOverlay";

// Next.js App Router tự hiện file này (Suspense fallback) khi điều hướng
// sang một route trong (site) mà Server Component đang chờ dữ liệu (vd. /thuc-don
// gọi fetchMenu()). Không cần state/JS thủ công cho trường hợp này.
export default function SiteLoading() {
  return <LoadingOverlay />;
}
