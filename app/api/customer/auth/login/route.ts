import { NextResponse } from "next/server";

import {
  type BackendCustomerMeResponse,
  toCustomerSessionUser,
  toCustomerTokens,
  writeCustomerCookies,
} from "@/lib/auth/customer-backend-session";
import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * BFF đăng nhập khách hàng: xác thực với Backend (POST /api/v1/customer/auth/login), lấy hồ sơ (GET /api/v1/customers/me),
 * lưu token vào cookie HttpOnly và chỉ trả thông tin khách cho trình duyệt. Response dạng ApiEnvelope { success, message,
 * data } — client tự bóc "data" khi thành công và đọc "message" khi lỗi.
 */
function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function loginFailureMessage(status: number): string {
  if (status === 401) return "Email hoặc mật khẩu không đúng.";
  if (status === 429) return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.";
  if (status === 400) return "Email hoặc mật khẩu không hợp lệ.";
  return "Đăng nhập thất bại.";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;

  if (!body || typeof body.email !== "string" || typeof body.password !== "string" || !body.email.trim() || !body.password) {
    return failure("Email và mật khẩu là bắt buộc.", 400);
  }

  try {
    const loginResponse = await fetchBackend("/customer/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: body.email.trim(), password: body.password, deviceInfo: request.headers.get("user-agent") }),
    });
    if (!loginResponse.ok) {
      return failure(loginFailureMessage(loginResponse.status), loginResponse.status);
    }

    const tokens = toCustomerTokens(await loginResponse.json());
    const meResponse = await fetchBackend("/customers/me", { accessToken: tokens.accessToken });
    if (!meResponse.ok) {
      return failure("Không thể tải thông tin tài khoản.", 502);
    }

    const user = toCustomerSessionUser((await meResponse.json()) as BackendCustomerMeResponse);
    const response = NextResponse.json({ success: true, message: "Đăng nhập thành công.", data: { user } });
    writeCustomerCookies(response, tokens);
    return response;
  } catch (error) {
    console.error("Customer login: không gọi được Backend", error);
    return failure("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", 503);
  }
}
