import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session-cookie";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Đã đăng xuất." });

  response.cookies.delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });

  return response;
}
