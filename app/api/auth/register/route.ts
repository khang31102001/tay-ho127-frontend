import { NextResponse } from "next/server";

// MOCK CONTRACT: sẽ được thay bằng ASP.NET Backend sau này.
const PHONE_REGEX = /^0\d{9,10}$/;
const RESERVED_PHONE = "0900127127";

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 650));

  const body = (await request.json().catch(() => null)) as
    | {
        fullName?: unknown;
        phone?: unknown;
        password?: unknown;
        confirmPassword?: unknown;
      }
    | null;

  if (
    !body ||
    typeof body.fullName !== "string" ||
    typeof body.phone !== "string" ||
    typeof body.password !== "string" ||
    typeof body.confirmPassword !== "string" ||
    !body.fullName.trim() ||
    !body.password
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng điền đầy đủ thông tin đăng ký.",
      },
      { status: 400 },
    );
  }

  const fullName = body.fullName.trim();
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

  if (body.password.length < 6) {
    return NextResponse.json(
      {
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      },
      { status: 400 },
    );
  }

  if (body.password !== body.confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "Xác nhận mật khẩu không khớp.",
      },
      { status: 400 },
    );
  }

  if (phone === RESERVED_PHONE) {
    return NextResponse.json(
      {
        success: false,
        message: "Số điện thoại này đã được đăng ký.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Đăng ký tài khoản thành công.",
    data: {
      user: {
        id: `user-${Date.now()}`,
        name: fullName,
        phone,
        provider: "credentials",
      },
    },
  });
}
