import { type NextRequest, NextResponse } from "next/server";

import { clearSessionCookies, fetchBackendAsAdmin, writeSessionCookies } from "@/lib/auth/admin-backend-session";

/**
 * BFF upload file media: /api/admin/media/upload → Backend POST /api/v1/media/upload.
 * Tách khỏi proxy chung app/api/admin/backend/[...path] vì proxy đó đọc body bằng
 * request.text() và ép Content-Type JSON — làm hỏng dữ liệu nhị phân của multipart.
 * Ở đây body giữ nguyên dạng byte và Content-Type (kèm boundary) của request gốc.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type");
  if (!contentType?.startsWith("multipart/form-data")) {
    return NextResponse.json({ title: "Yêu cầu phải là multipart/form-data.", status: 400 }, { status: 400 });
  }

  try {
    // ArrayBuffer (không phải stream) vì fetchBackendAsAdmin có thể gửi lại request sau khi refresh token.
    const body = await request.arrayBuffer();
    const { response: backendResponse, tokens, unauthenticated } = await fetchBackendAsAdmin(request, "/media/upload", {
      method: "POST",
      body,
      headers: { "Content-Type": contentType },
    });

    const response = new NextResponse(backendResponse.status === 204 ? null : await backendResponse.arrayBuffer(), {
      status: backendResponse.status,
      headers: { "Content-Type": backendResponse.headers.get("content-type") ?? "application/json" },
    });

    if (unauthenticated) {
      clearSessionCookies(response);
    } else if (tokens) {
      writeSessionCookies(response, tokens);
    }

    return response;
  } catch (error) {
    console.error("Admin BFF: không upload được media lên Backend", error);
    return NextResponse.json({ title: "Không thể kết nối tới máy chủ.", status: 503 }, { status: 503 });
  }
}
