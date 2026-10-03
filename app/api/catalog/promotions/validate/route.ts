import { NextResponse } from "next/server";

import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * Kiểm tra mã giảm giá cho Checkout của khách (không cần đăng nhập) — proxy tới Backend POST
 * /api/v1/catalog/promotions/validate. Backend giới hạn tần suất để chặn dò mã. Không có logic nghiệp vụ nào ở đây.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const response = await fetchBackend("/catalog/promotions/validate", { method: "POST", body: await request.text() });
    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    console.error("Promotion validate: không gọi được Backend", error);
    return NextResponse.json({ title: "Không thể kết nối tới máy chủ.", status: 503 }, { status: 503 });
  }
}
