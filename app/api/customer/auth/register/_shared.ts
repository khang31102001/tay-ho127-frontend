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

/** Backend trả "Retry-After" (giây) cùng mã 429 khi chạm giới hạn gửi mã; không có/không hợp lệ thì undefined. */
export function readRetryAfterSeconds(response: Response): number | undefined {
  const seconds = Number(response.headers.get("retry-after"));
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : undefined;
}

/** Chữ có dấu tiếng Việt: Backend (CustomerAuthService) trả lỗi nghiệp vụ đã là câu tiếng Việt cho khách. */
const VIETNAMESE_TEXT = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;

/**
 * Chuyển lỗi của Backend (POST /customer/auth/register/otp và /register) thành câu hiển thị cho khách: 409 trùng
 * email/SĐT, 429 chạm giới hạn gửi mã (đọc header Retry-After), 503 không gửi được mã; 400 giữ nguyên thông báo
 * tiếng Việt của Backend (mã hết hạn / sai / nhập sai quá số lần...). Lỗi khác dùng `fallback`.
 */
export function registrationFailureMessage(
  status: number,
  detail: string | undefined,
  fallback: string,
  retryAfterSeconds?: number,
): string {
  if (status === 409) return "Email hoặc số điện thoại này đã được đăng ký.";

  if (status === 429) {
    return retryAfterSeconds
      ? `Vui lòng đợi ${retryAfterSeconds} giây trước khi gửi lại mã.`
      : "Bạn đã yêu cầu quá nhiều mã cho số điện thoại này. Vui lòng thử lại sau ít phút.";
  }

  if (status === 503) return "Không gửi được mã xác minh. Vui lòng thử lại sau ít phút.";

  if (status === 400 && detail && VIETNAMESE_TEXT.test(detail)) return detail;

  return fallback;
}

/**
 * Backend đang TẮT xác minh số điện thoại (Customer:PhoneVerification:Required = false): POST /register/otp trả 400 với
 * thông báo này. Khi đó đăng ký chỉ còn 1 bước (POST /register không cần mã) — không phải lỗi với khách.
 */
export function isPhoneVerificationDisabled(status: number, detail: string | undefined): boolean {
  return status === 400 && !!detail && detail.includes("chưa được bật");
}
