import { type NextRequest, NextResponse } from "next/server";

import {
  type BackendMeResponse,
  clearSessionCookies,
  fetchBackendAsAdmin,
  toAdminSessionUser,
  writeSessionCookies,
} from "@/lib/auth/admin-backend-session";

/**
 * Admin đang đăng nhập (từ cookie phiên) — AdminAuthProvider gọi khi tải
 * trang để khôi phục phiên, thay cho việc lưu user trong localStorage. Quyền
 * luôn lấy mới từ Backend, nên đổi role/quyền có hiệu lực ngay lần tải sau.
 */
export async function GET(request: NextRequest) {
  try {
    const { response: backendResponse, tokens, unauthenticated } = await fetchBackendAsAdmin(request, "/me");

    if (unauthenticated || !backendResponse.ok) {
      const response = NextResponse.json({ success: false, message: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
      clearSessionCookies(response);
      return response;
    }

    const user = toAdminSessionUser((await backendResponse.json()) as BackendMeResponse);
    const response = NextResponse.json({ success: true, message: "OK", data: { user } });
    if (tokens) writeSessionCookies(response, tokens);
    return response;
  } catch (error) {
    console.error("Admin session: không gọi được Backend", error);
    return NextResponse.json({ success: false, message: "Không thể kết nối tới máy chủ." }, { status: 503 });
  }
}
