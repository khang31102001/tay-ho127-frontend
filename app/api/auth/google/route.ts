import { NextResponse } from "next/server";

export async function POST() {
  await new Promise((resolve) => setTimeout(resolve, 650));

  return NextResponse.json({
    success: true,
    message: "Đăng nhập Google thành công.",
    data: {
      user: {
        id: "google-demo-001",
        name: "Google Demo User",
        email: "google.demo@gmail.com",
        provider: "google",
      },
      accessToken: "mock-access-token-google",
    },
  });
}
