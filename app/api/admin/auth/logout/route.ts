import { type NextRequest, NextResponse } from "next/server";

import { clearSessionCookies, fetchBackendAsAdmin, readSessionTokens } from "@/lib/auth/admin-backend-session";

/**
 * BFF logout: thu hồi refresh token ở Backend (best effort — lỗi mạng vẫn
 * đăng xuất phía trình duyệt) rồi xóa toàn bộ cookie phiên.
 */
export async function POST(request: NextRequest) {
  const { refreshToken } = readSessionTokens(request);

  if (refreshToken) {
    try {
      await fetchBackendAsAdmin(request, "/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Admin logout: không thu hồi được refresh token ở Backend", error);
    }
  }

  const response = NextResponse.json({ success: true, message: "Đã đăng xuất." });
  clearSessionCookies(response);
  return response;
}
