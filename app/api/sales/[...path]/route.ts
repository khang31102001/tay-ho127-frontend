import { type NextRequest, NextResponse } from "next/server";

import { clearCustomerCookies, fetchBackendAsCustomer, writeCustomerCookies } from "@/lib/auth/customer-backend-session";

/**
 * BFF proxy của TRANG SITE cho nghiệp vụ bán hàng: /api/sales/<path> → Backend /api/v1/sales/<path>. Chỉ cho đi qua đúng
 * những endpoint dành cho khách (danh sách trong ALLOWED_ROUTES) — các endpoint quản trị của Sales (orders, payments...)
 * KHÔNG nằm trong danh sách này nên không thể gọi từ đây; Admin dùng /api/admin/backend (kèm token Admin).
 *
 * Token khách (cookie HttpOnly) nếu có thì được gắn vào để Backend liên kết đơn hàng với tài khoản; khách vãng lai vẫn đặt
 * hàng được. Backend tự kiểm tra mọi quy tắc nghiệp vụ — không có logic nghiệp vụ nào ở đây.
 */
type RouteContext = { params: { path: string[] } };

// Phụ thuộc cookie của từng request — không bao giờ render tĩnh/cache.
export const dynamic = "force-dynamic";

const UUID = "[0-9a-fA-F-]{36}";

type AllowedRoute = { method: "GET" | "POST"; pattern: RegExp; requireSession: boolean };

const ALLOWED_ROUTES: AllowedRoute[] = [
  { method: "GET", pattern: /^public\/(delivery-methods|payment-methods|order-options)$/, requireSession: false },
  { method: "POST", pattern: /^public\/orders$/, requireSession: false },
  { method: "POST", pattern: /^public\/orders\/(lookup|retry-payment)$/, requireSession: false },
  { method: "POST", pattern: /^public\/payment-sessions$/, requireSession: false },
  { method: "GET", pattern: new RegExp(`^public/payment-sessions/${UUID}$`), requireSession: false },
  { method: "POST", pattern: new RegExp(`^public/payment-sessions/${UUID}/(cancel|retry)$`), requireSession: false },
  { method: "GET", pattern: /^customer\/orders$/, requireSession: true },
  { method: "GET", pattern: /^customer\/orders\/[A-Za-z0-9_-]{1,64}$/, requireSession: true },
];

async function proxy(request: NextRequest, { params }: RouteContext) {
  const subPath = params.path.join("/");
  const route = ALLOWED_ROUTES.find((candidate) => candidate.method === request.method && candidate.pattern.test(subPath));
  if (!route) {
    return NextResponse.json({ title: "Không tìm thấy.", status: 404 }, { status: 404 });
  }

  const path = `/sales/${params.path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET";

  try {
    const { response: backendResponse, tokens, unauthenticated } = await fetchBackendAsCustomer(
      request,
      path,
      { method: request.method, body: hasBody ? await request.text() : undefined },
      { requireSession: route.requireSession },
    );

    const body = backendResponse.status === 204 ? null : await backendResponse.arrayBuffer();
    const response = new NextResponse(body, {
      status: backendResponse.status,
      headers: { "Content-Type": backendResponse.headers.get("content-type") ?? "application/json" },
    });

    if (unauthenticated) {
      clearCustomerCookies(response);
    } else if (tokens) {
      writeCustomerCookies(response, tokens);
    }

    return response;
  } catch (error) {
    console.error(`Sales BFF: không gọi được Backend (${request.method} ${path})`, error);
    return NextResponse.json({ title: "Không thể kết nối tới máy chủ.", status: 503 }, { status: 503 });
  }
}

export { proxy as GET, proxy as POST };
