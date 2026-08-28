import { NextResponse } from "next/server";

// MOCK CONTRACT: chưa có backend admin thật, tài khoản hard-code để demo luồng đăng nhập.
const DEMO_ADMIN_ACCOUNT = {
  email: "admin@tayho127.vn",
  password: "admin123",
} as const;

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 650));

  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;

  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Email và mật khẩu là bắt buộc.",
      },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();

  if (
    email !== DEMO_ADMIN_ACCOUNT.email ||
    body.password !== DEMO_ADMIN_ACCOUNT.password
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Email hoặc mật khẩu không đúng.",
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Đăng nhập thành công.",
    data: {
      user: {
        id: "admin-demo-001",
        name: "Quản trị viên",
        email: DEMO_ADMIN_ACCOUNT.email,
      },
      accessToken: "mock-access-token-admin",
    },
  });
}
