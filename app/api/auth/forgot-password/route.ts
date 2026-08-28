import { NextResponse } from "next/server";

// MOCK CONTRACT: sẽ được thay bằng ASP.NET Backend sau này.
// Chỉ xử lý bước gửi yêu cầu theo số điện thoại; không sinh OTP hay reset password ở đây.
const PHONE_REGEX = /^0\d{9,10}$/;

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 650));

  const body = (await request.json().catch(() => null)) as
    | { phone?: unknown }
    | null;

  if (!body || typeof body.phone !== "string" || !body.phone.trim()) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng nhập số điện thoại.",
      },
      { status: 400 },
    );
  }

  const phone = body.phone.trim();

  if (!PHONE_REGEX.test(phone)) {
    return NextResponse.json(
      {
        success: false,
        message: "Số điện thoại không hợp lệ.",
      },
      { status: 400 },
    );
  }

  // Không tiết lộ số điện thoại có tồn tại trong hệ thống hay không.
  return NextResponse.json({
    success: true,
    message: "Yêu cầu đã được gửi. Vui lòng kiểm tra tin nhắn để lấy lại mật khẩu.",
  });
}
