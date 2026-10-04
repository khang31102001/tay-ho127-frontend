import { type NextRequest, NextResponse } from "next/server";

import {
  type BackendCustomerMeResponse,
  clearCustomerCookies,
  fetchBackendAsCustomer,
  toCustomerSessionUser,
  writeCustomerCookies,
} from "@/lib/auth/customer-backend-session";

/**
 * Phiên khách hàng hiện tại (GET /api/v1/customers/me qua cookie HttpOnly, tự refresh khi access token hết hạn). Trình
 * duyệt gọi route này khi tải trang để biết "đã đăng nhập chưa" — thay cho việc tự lưu thông tin đăng nhập ở localStorage.
 * Chưa đăng nhập (hoặc phiên đã hết hạn hẳn) KHÔNG phải lỗi: trả 200 với data.user = null, để mỗi lần tải trang của khách vãng
 * lai không sinh ra một lỗi 401 đỏ trong console. Phiên hết hạn thì cookie hỏng được dọn luôn.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { response: meResponse, tokens, unauthenticated } = await fetchBackendAsCustomer(request, "/customers/me");

    if (!meResponse.ok) {
      const response = NextResponse.json({ success: true, message: "Chưa đăng nhập.", data: { user: null } });
      if (unauthenticated) clearCustomerCookies(response);
      return response;
    }

    const user = toCustomerSessionUser((await meResponse.json()) as BackendCustomerMeResponse);
    const response = NextResponse.json({ success: true, message: "OK", data: { user } });
    if (tokens) writeCustomerCookies(response, tokens);
    return response;
  } catch (error) {
    console.error("Customer session: không gọi được Backend", error);
    return NextResponse.json({ success: false, message: "Không thể kết nối tới máy chủ." }, { status: 503 });
  }
}
