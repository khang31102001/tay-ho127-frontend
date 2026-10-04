import { NextResponse, type NextRequest } from "next/server";

import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * Kiểm tra mã giảm giá cho Checkout (không cần đăng nhập) — proxy tới Backend
 * POST /api/v1/catalog/promotions/validate. Không có logic nghiệp vụ ở đây:
 * Backend tính giảm giá; route chỉ chuyển body và giữ nguyên status (400, 429...).
 */

// Phụ thuộc body từng request — không bao giờ render tĩnh/cache.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const response = await fetchBackend("/catalog/promotions/validate", {
      method: "POST",
      body: await request.text(),
    });

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    console.error("Validate promotion: không gọi được Backend", error);
    return NextResponse.json({ title: "Không thể kết nối tới máy chủ." }, { status: 503 });
  }
}
