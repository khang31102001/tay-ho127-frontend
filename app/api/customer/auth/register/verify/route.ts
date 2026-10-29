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
 * BFF đăng ký, bước 2: tạo tài khoản (POST /api/v1/customer/auth/register). Backend không giữ thông tin đăng ký giữa hai
 * bước, nên trình duyệt gửi lại đủ họ tên / SĐT / email / mật khẩu cùng `challengeId` (từ bước 1) và `code` (mã khách
 * nhập). Mã đúng → Backend tạo tài khoản (số điện thoại đã xác minh) và trả token; ở đây lưu token vào cookie HttpOnly rồi
 * chỉ trả thông tin khách cho trình duyệt, y như đăng nhập.
 *
 * Không có `challengeId`/`code` = Backend đang tắt xác minh số điện thoại (bước 1 báo `verificationRequired: false`).
 * Khi xác minh đang BẬT, Backend tự từ chối (400) yêu cầu thiếu mã, nên không cần tin vào trình duyệt ở điểm này.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        fullName?: unknown;
        phone?: unknown;
        email?: unknown;
        password?: unknown;
        challengeId?: unknown;
        code?: unknown;
      }
    | null;

  if (
    !body ||
    typeof body.fullName !== "string" ||
    typeof body.phone !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !body.fullName.trim() ||
    !body.email.trim() ||
    !body.password
  ) {
    return failure("Vui lòng điền đầy đủ thông tin đăng ký.", 400);
  }

  if (!isValidPhone(body.phone)) {
    return failure("Số điện thoại không hợp lệ.", 400);
  }

  const hasChallenge = typeof body.challengeId === "string" && body.challengeId.length > 0;
  const hasCode = typeof body.code === "string" && body.code.trim().length > 0;
  if (hasChallenge !== hasCode) {
    return failure("Vui lòng nhập mã xác minh.", 400);
  }

  let otpCode: string | undefined;
  if (hasCode) {
    otpCode = (body.code as string).replace(/\s/g, "");
    if (!/^\d{4,8}$/.test(otpCode)) {
      return failure("Mã xác minh gồm các chữ số.", 400);
    }
  }

  try {
    const registerResponse = await fetchBackend("/customer/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: body.fullName.trim(),
        phone: normalizePhone(body.phone),
        email: body.email.trim(),
        password: body.password,
        otpChallengeId: hasChallenge ? body.challengeId : undefined,
        otpCode,
      }),
    });
    if (!registerResponse.ok) {
      const detail = await readProblemDetail(registerResponse);
      return failure(registrationFailureMessage(registerResponse.status, detail, "Đăng ký thất bại."), registerResponse.status);
    }

    const tokens = toCustomerTokens(await registerResponse.json());
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
