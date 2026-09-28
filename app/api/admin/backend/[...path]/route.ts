import { type NextRequest, NextResponse } from "next/server";

import { clearSessionCookies, fetchBackendAsAdmin, writeSessionCookies } from "@/lib/auth/admin-backend-session";

/**
 * BFF proxy duy nhất của Admin Portal: /api/admin/backend/<path>?<query>
 * → Backend /api/v1/<path>?<query>, gắn Bearer từ cookie HttpOnly (tự refresh
 * khi hết hạn). Không có logic nghiệp vụ nào ở đây — Backend tự kiểm tra quyền.
 * Mọi service Admin gọi qua `adminApi` (src/lib/http/admin-api.ts).
 */
type RouteContext = { params: { path: string[] } };

async function proxy(request: NextRequest, { params }: RouteContext) {
  const path = `/${params.path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const { response: backendResponse, tokens, unauthenticated } = await fetchBackendAsAdmin(request, path, {
      method: request.method,
      body: hasBody ? await request.text() : undefined,
    });

    const body = backendResponse.status === 204 ? null : await backendResponse.arrayBuffer();
    const response = new NextResponse(body, {
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
    console.error(`Admin BFF: không gọi được Backend (${request.method} ${path})`, error);
    return NextResponse.json(
      { title: "Không thể kết nối tới máy chủ.", status: 503 },
      { status: 503 },
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
