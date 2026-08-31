import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session-cookie";

const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * Chặn /admin/* ở server (edge) trước khi HTML render ra — AdminGuard
 * (client component, useEffect) chỉ redirect SAU khi JS đã tải, vẫn để lộ
 * HTML/JS của trang admin trong khoảnh khắc đó. Middleware là lớp bảo vệ
 * thật; AdminGuard vẫn giữ lại như lớp UX phụ (tránh nháy nội dung).
 *
 * MOCK CONTRACT: chỉ kiểm tra SỰ TỒN TẠI của cookie phiên (xem
 * src/lib/auth/admin-session-cookie.ts) — không xác thực chữ ký/hạn dùng vì
 * chưa có backend thật cấp session/JWT thật. Khi có backend ASP.NET Core,
 * chỗ này cần verify token thật (vd. giải mã JWT hoặc gọi endpoint whoami).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);
  const isLoginPath = pathname === ADMIN_LOGIN_PATH;

  if (!isLoginPath && !hasSession) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  if (isLoginPath && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
