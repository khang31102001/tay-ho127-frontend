import { NextResponse } from "next/server";

import {
  type BackendMeResponse,
  loginWithPassword,
  toAdminSessionUser,
  writeSessionCookies,
} from "@/lib/auth/admin-backend-session";
import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * BFF login: xác thực với Backend (POST /api/v1/auth/login), lấy hồ sơ + quyền
 * (GET /api/v1/me), lưu token vào cookie HttpOnly và chỉ trả thông tin user
 * cho trình duyệt. Response dạng ApiEnvelope { success, message, data } —
 * api-client tự bóc "data" khi thành công và đọc "message" khi lỗi.
 */
function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function loginFailureMessage(status: number): string {
  if (status === 401) return "Email hoặc mật khẩu không đúng.";
  if (status === 429) return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.";
  if (status === 400) return "Email và mật khẩu là bắt buộc.";
  return "Đăng nhập thất bại.";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;

  if (!body || typeof body.email !== "string" || typeof body.password !== "string" || !body.email.trim() || !body.password) {
    return failure("Email và mật khẩu là bắt buộc.", 400);
  }

  try {
    const result = await loginWithPassword(body.email.trim(), body.password, request.headers.get("user-agent"));
    if ("error" in result) {
      return failure(loginFailureMessage(result.error.status), result.error.status);
    }

    const meResponse = await fetchBackend("/me", { accessToken: result.tokens.accessToken });
    if (!meResponse.ok) {
      return failure("Tài khoản không có quyền truy cập trang quản trị.", meResponse.status === 403 ? 403 : 401);
    }

    const user = toAdminSessionUser((await meResponse.json()) as BackendMeResponse);
    const response = NextResponse.json({ success: true, message: "Đăng nhập thành công.", data: { user } });
    writeSessionCookies(response, result.tokens);
    return response;
  } catch (error) {
    console.error("Admin login: không gọi được Backend", error);
    return failure("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", 503);
  }
}
