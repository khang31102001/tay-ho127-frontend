import { LoadingOverlay } from "@/components/shared/LoadingOverlay";

// Suspense fallback tự động của Next.js khi điều hướng giữa các route trong
// Admin Portal (dashboard) mà Server Component đang chờ dữ liệu.
export default function AdminDashboardLoading() {
  return <LoadingOverlay />;
}
