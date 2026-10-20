import { NextResponse } from "next/server";

/**
 * Dùng chung cho 2 bước đăng ký (request-otp, verify) của BFF khách hàng. Response dạng ApiEnvelope
 * { success, message, data } — client đọc "message" khi lỗi.
 */
export function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

/** Số điện thoại di động VN dạng 0xxxxxxxxx (cùng quy tắc Backend: PhoneNumberNormalizer). */
const PHONE_REGEX = /^0\d{9,10}$/;

/** Chuẩn hóa như Backend để báo lỗi sớm bằng tiếng Việt: "+84 901 234 567" → "0901234567". */
export function normalizePhone(value: string): string {
  let digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+84")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("84") && (digits.length === 11 || digits.length === 12)) digits = `0${digits.slice(2)}`;
  return digits;
}

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(normalizePhone(value));
}

/** ProblemDetails.detail của Backend (chuỗi tiếng Anh) hoặc undefined. */
export async function readProblemDetail(response: Response): Promise<string | undefined> {
  const problem = (await response.json().catch(() => null)) as { detail?: unknown } | null;
  return typeof problem?.detail === "string" ? problem.detail : undefined;
}

/**
 * Backend trả lỗi nghiệp vụ bằng tiếng Anh; ở đây đổi sang câu tiếng Việt cho khách. Khớp theo nội dung các thông báo của
 * CustomerAuthService (RequestRegistrationOtpAsync / VerifyRegistrationOtpAsync) — đổi chữ ở Backend thì sửa ở đây.
 */
export function registrationFailureMessage(status: number, detail: string | undefined, fallback: string): string {
  if (status === 409) return "Email hoặc số điện thoại này đã được đăng ký.";

  if (status === 429) {
    const seconds = detail?.match(/wait (\d+) seconds/)?.[1];
    return seconds
      ? `Vui lòng đợi ${seconds} giây trước khi gửi lại mã.`
      : "Bạn đã yêu cầu quá nhiều mã cho số điện thoại này. Vui lòng thử lại sau ít phút.";
  }

  if (status === 400 && detail) {
    if (detail.includes("has expired")) return "Mã xác minh đã hết hạn. Vui lòng gửi lại mã mới.";
    if (detail.includes("is incorrect")) return "Mã xác minh không đúng. Vui lòng kiểm tra lại.";
    if (detail.includes("Too many incorrect attempts")) return "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.";
    if (detail.includes("could not send")) return "Không gửi được mã xác minh. Vui lòng thử lại sau ít phút.";
  }

  return fallback;
}
