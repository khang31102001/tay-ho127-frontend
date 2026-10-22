import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Import thẳng service (không qua barrel @/features/redirects) — barrel đó
// re-export UI Admin ("use client": RedirectsExplorer/RedirectEditor), import
// qua barrel ở Middleware sẽ kéo UI Admin vào Edge bundle. Cùng lý do đã áp
// dụng cho @/features/seo ở app/(site)/**.
import { findActiveRedirect } from "@/features/redirects/services/redirect-public.service";
import { ORDERING_ENABLED, isOrderingOnlyPath } from "@/core/config/features";

/**
 * Task 25 — Redirect Management. Kiểm tra pathname khớp source_path đã cấu
 * hình tại Admin > SEO > Chuyển hướng, trả 301/302 tương ứng nếu có, không
 * thì cho request đi tiếp bình thường.
 *
 * findActiveRedirect() đọc danh sách redirect đang bật từ Backend (GET /seo/public/redirects),
 * giữ trong bộ nhớ 60 giây và fail-open khi Backend lỗi — xem redirect-public.service.ts.
 */
/**
 * Địa chỉ mà khách thực sự đang truy cập. Trong Docker/sau Nginx, request.url mang tên máy nội bộ (localhost:3000) nên
 * chuyển hướng dựng từ nó sẽ đưa khách tới địa chỉ sai; Nginx truyền sẵn Host và X-Forwarded-Proto.
 */
function publicOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;

  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export async function middleware(request: NextRequest) {
  // Đăng nhập khách / giỏ hàng / đặt món chưa mở ở môi trường này: gõ tay địa chỉ cũng về trang thực đơn.
  if (!ORDERING_ENABLED && isOrderingOnlyPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/thuc-don", publicOrigin(request)));
  }

  const redirect = await findActiveRedirect(request.nextUrl.pathname);

  if (!redirect) {
    return NextResponse.next();
  }

  const destination = redirect.destinationUrl.startsWith("http")
    ? redirect.destinationUrl
    : new URL(redirect.destinationUrl, request.url);

  return NextResponse.redirect(destination, redirect.redirectType);
}

export const config = {
  // Bỏ qua static asset/API/admin/_next — redirect chỉ áp dụng cho route
  // public (Product/Category/Article/Page cũ đổi slug), không can thiệp vào
  // khu vực quản trị hay hạ tầng Next.js.
  matcher: ["/((?!_next|api|admin|images|fonts|favicon.ico).*)"],
};
