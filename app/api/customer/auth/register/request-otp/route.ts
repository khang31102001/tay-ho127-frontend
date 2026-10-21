import { NextResponse } from "next/server";

import { fetchBackend } from "@/core/auth/backend-fetch";

import {
  failure,
  isPhoneVerificationDisabled,
  isValidPhone,
  normalizePhone,
  readProblemDetail,
  readRetryAfterSeconds,
  registrationFailureMessage,
} from "../_shared";

/**
 * BFF đăng ký, bước 1: xin mã OTP (POST /api/v1/customer/auth/register/otp, chỉ gửi số điện thoại + email). Backend kiểm
 * tra email/SĐT chưa dùng rồi gửi mã tới số điện thoại (Zalo/SMS) và trả `challengeId`; Backend KHÔNG giữ thông tin đăng
 * ký, nên trình duyệt phải giữ `challengeId` cùng dữ liệu form để gửi lại ở bước 2 (route verify). CHƯA có tài khoản nào
 * được tạo.
 *
 * Backend tắt xác minh số điện thoại (Customer:PhoneVerification:Required = false) → trả `verificationRequired: false`:
 * trình duyệt bỏ bước nhập mã và gọi thẳng bước 2.
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
    const backendResponse = await fetchBackend("/customer/auth/register/otp", {
      method: "POST",
      body: JSON.stringify({ phone: normalizePhone(body.phone), email: body.email.trim() }),
    });
    if (!backendResponse.ok) {
      const detail = await readProblemDetail(backendResponse);

      if (isPhoneVerificationDisabled(backendResponse.status, detail)) {
        return NextResponse.json({
          success: true,
          message: "Không cần xác minh số điện thoại.",
          data: { verificationRequired: false },
        });
      }

      return failure(
        registrationFailureMessage(
          backendResponse.status,
          detail,
          "Không gửi được mã xác minh.",
          readRetryAfterSeconds(backendResponse),
        ),
        backendResponse.status,
      );
    }

    const result = (await backendResponse.json()) as {
      challengeId: string;
      expiresAtUtc: string;
      resendAfterSeconds: number;
    };
    return NextResponse.json({
      success: true,
      message: "Đã gửi mã xác minh tới số điện thoại của bạn.",
      data: {
        verificationRequired: true,
        challengeId: result.challengeId,
        expiresAt: result.expiresAtUtc,
        // Backend trả số giây phải đợi; trình duyệt cần mốc thời điểm tuyệt đối để đếm ngược.
        resendAvailableAt: new Date(Date.now() + result.resendAfterSeconds * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("Customer register (request-otp): không gọi được Backend", error);
    return failure("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.", 503);
  }
}
