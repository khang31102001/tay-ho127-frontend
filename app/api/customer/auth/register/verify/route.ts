import { NextResponse } from "next/server";

import {
  type BackendCustomerMeResponse,
  toCustomerSessionUser,
  toCustomerTokens,
  writeCustomerCookies,
} from "@/core/auth/customer-backend-session";
import { fetchBackend } from "@/core/auth/backend-fetch";

import { failure, isValidPhone, normalizePhone, readProblemDetail, registrationFailureMessage } from "../_shared";

/**
 * BFF đăng ký, bước 2: xác minh mã OTP (POST /api/v1/customer/auth/register/verify). Mã đúng → Backend tạo tài khoản
 * (số điện thoại đã xác minh) và trả token; ở đây lưu token vào cookie HttpOnly rồi chỉ trả thông tin khách cho trình duyệt,
 * y như đăng nhập.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { phone?: unknown; code?: unknown } | null;

  if (!body || typeof body.phone !== "string" || typeof body.code !== "string" || !body.code.trim()) {
    return failure("Vui lòng nhập mã xác minh.", 400);
  }

  if (!isValidPhone(body.phone)) {
    return failure("Số điện thoại không hợp lệ.", 400);
  }

  const code = body.code.replace(/\s/g, "");
  if (!/^\d{4,8}$/.test(code)) {
    return failure("Mã xác minh gồm các chữ số.", 400);
  }

  try {
    const verifyResponse = await fetchBackend("/customer/auth/register/verify", {
      method: "POST",
      body: JSON.stringify({ phone: normalizePhone(body.phone), code, deviceInfo: request.headers.get("user-agent") }),
    });
    if (!verifyResponse.ok) {
      const detail = await readProblemDetail(verifyResponse);
      return failure(registrationFailureMessage(verifyResponse.status, detail, "Xác minh thất bại."), verifyResponse.status);
    }

    const tokens = toCustomerTokens(await verifyResponse.json());
    const meResponse = await fetchBackend("/customers/me", { accessToken: tokens.accessToken });
    if (!meResponse.ok) {
      return failure("Đăng ký thành công nhưng không thể tải thông tin tài khoản. Vui lòng đăng nhập lại.", 502);
    }

    const user = toCustomerSessionUser((await meResponse.json()) as BackendCustomerMeResponse);
    const response = NextResponse.json({ success: true, message: "Đăng ký tài khoản thành công.", data: { user } }, { status: 201 });
    writeCustomerCookies(response, tokens);
    return response;
  } catch (error) {
    console.error("Customer register (verify): không gọi được Backend", error);
    return failure("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", 503);
  }
}
