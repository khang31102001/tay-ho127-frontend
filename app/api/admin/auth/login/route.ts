import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/admin-session-cookie";

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

  const response = NextResponse.json({
    success: true,
    message: "Đăng nhập thành công.",
    data: {
      user: {
        id: "admin-demo-001",
        name: "Quản trị viên",
        email: DEMO_ADMIN_ACCOUNT.email,
        // MOCK CONTRACT: tài khoản demo duy nhất, cấp toàn bộ permission hiện có
        // (xem PERMISSION_OPTIONS ở src/features/roles/types/role.types.ts).
        permissions: ["menu:manage", "user:manage", "role:manage", "order:manage"],
      },
      accessToken: "mock-access-token-admin",
    },
  });

  // Cookie này là điều kiện middleware.ts (chạy server-side) dùng để chặn
  // /admin/* — khác với localStorage (chỉ đọc được ở client, không giúp gì
  // cho việc chặn HTML render trước khi JS kịp redirect).
  response.cookies.set(ADMIN_SESSION_COOKIE, "mock-access-token-admin", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
