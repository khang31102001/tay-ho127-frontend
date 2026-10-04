import { type NextRequest, NextResponse } from "next/server";

import { clearCustomerCookies, readCustomerTokens } from "@/lib/auth/customer-backend-session";
import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * BFF đăng xuất khách hàng: thu hồi refresh token ở Backend (POST /api/v1/customer/auth/logout) rồi xóa cookie. Luôn xóa
 * cookie và trả 200 kể cả khi Backend lỗi — người dùng phải thoát được khỏi phiên trên trình duyệt này.
 */
export async function POST(request: NextRequest) {
  const { refreshToken } = readCustomerTokens(request);

  if (refreshToken) {
    try {
      await fetchBackend("/customer/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) });
    } catch (error) {
      console.error("Customer logout: không thu hồi được refresh token ở Backend", error);
    }
  }

  const response = NextResponse.json({ success: true, message: "Đã đăng xuất." });
  clearCustomerCookies(response);
  return response;
}
