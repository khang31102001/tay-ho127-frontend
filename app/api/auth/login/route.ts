import { NextResponse } from "next/server";

const DEMO_ACCOUNT = {
  email: "demo@tayho127.vn",
  password: "123456",
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
    email !== DEMO_ACCOUNT.email ||
    body.password !== DEMO_ACCOUNT.password
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
        id: "user-demo-001",
        name: "Khách hàng Demo",
        email: DEMO_ACCOUNT.email,
        provider: "credentials",
      },
      accessToken: "mock-access-token-credentials",
    },
  });
}
