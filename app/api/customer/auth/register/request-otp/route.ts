import { NextResponse } from "next/server";

import { fetchBackend } from "@/core/auth/backend-fetch";

import { failure, isValidPhone, normalizePhone, readProblemDetail, registrationFailureMessage } from "../_shared";

/**
 * BFF đăng ký, bước 1: gửi thông tin đăng ký sang Backend (POST /api/v1/customer/auth/register/request-otp). Backend kiểm
 * tra email/SĐT chưa dùng, lưu đăng ký tạm và gửi mã OTP tới số điện thoại (Zalo/SMS). CHƯA có tài khoản nào được tạo —
 * tài khoản chỉ ra đời ở bước 2 (verify).
 */
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

  if (!isValidPhone(body.phone)) {
    return failure("Số điện thoại không hợp lệ.", 400);
  }

  if (body.password.length < 8) {
    return failure("Mật khẩu cần tối thiểu 8 ký tự.", 400);
  }

  if (body.password !== body.confirmPassword) {
    return failure("Xác nhận mật khẩu không khớp.", 400);
  }

  try {
    const backendResponse = await fetchBackend("/customer/auth/register/request-otp", {
      method: "POST",
      body: JSON.stringify({
        fullName: body.fullName.trim(),
        phone: normalizePhone(body.phone),
        email: body.email.trim(),
        password: body.password,
      }),
    });
    if (!backendResponse.ok) {
      const detail = await readProblemDetail(backendResponse);
      return failure(
        registrationFailureMessage(backendResponse.status, detail, "Không gửi được mã xác minh."),
        backendResponse.status,
      );
    }

    const result = (await backendResponse.json()) as { expiresAtUtc: string; resendAvailableAtUtc: string };
    return NextResponse.json({
      success: true,
      message: "Đã gửi mã xác minh tới số điện thoại của bạn.",
      data: { expiresAt: result.expiresAtUtc, resendAvailableAt: result.resendAvailableAtUtc },
    });
  } catch (error) {
    console.error("Customer register (request-otp): không gọi được Backend", error);
    return failure("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", 503);
  }
}
