import { NextResponse } from "next/server";

import {
  type BackendCustomerMeResponse,
  toCustomerSessionUser,
  toCustomerTokens,
  writeCustomerCookies,
} from "@/lib/auth/customer-backend-session";
import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * BFF đăng ký khách hàng: tạo tài khoản ở Backend (POST /api/v1/customer/auth/register — trả luôn token), rồi đăng nhập
 * ngay (cookie HttpOnly). Backend kiểm tra mọi quy tắc (email/SĐT trùng → 409, mật khẩu tối thiểu 8 ký tự → 400).
 */
function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function registerFailureMessage(status: number, detail: string | undefined): string {
  if (status === 409) return "Email hoặc số điện thoại này đã được đăng ký.";
  if (status === 429) return "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ít phút.";
  if (status === 400) return detail ?? "Thông tin đăng ký không hợp lệ.";
  return "Đăng ký thất bại.";
}

/** ProblemDetails của Backend: lấy lỗi field đầu tiên (đã là câu đọc được) hoặc "detail". */
function readProblemMessage(problem: unknown): string | undefined {
  if (!problem || typeof problem !== "object") return undefined;
  const { errors, detail } = problem as { errors?: Record<string, unknown>; detail?: unknown };
  const firstFieldError = errors
    ? Object.values(errors)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .find((value): value is string => typeof value === "string" && value.trim() !== "")
    : undefined;
  return firstFieldError ?? (typeof detail === "string" ? detail : undefined);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { fullName?: unknown; phone?: unknown; email?: unknown; password?: unknown; confirmPassword?: unknown }
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

  if (body.password !== body.confirmPassword) {
    return failure("Xác nhận mật khẩu không khớp.", 400);
  }

  try {
    const registerResponse = await fetchBackend("/customer/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: body.fullName.trim(),
        phone: body.phone.trim(),
        email: body.email.trim(),
        password: body.password,
      }),
    });
    if (!registerResponse.ok) {
      const problem = await registerResponse.json().catch(() => null);
      return failure(registerFailureMessage(registerResponse.status, readProblemMessage(problem)), registerResponse.status);
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
    console.error("Customer register: không gọi được Backend", error);
    return failure("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", 503);
  }
}
