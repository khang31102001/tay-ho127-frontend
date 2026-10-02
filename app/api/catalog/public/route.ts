import { NextResponse } from "next/server";

import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * Catalog đang bán cho phía trình duyệt (không cần đăng nhập) — proxy tới
 * Backend GET /api/v1/catalog/public. Server Component gọi thẳng Backend,
 * không qua route này (xem features/catalog-public/services/public-catalog.service.ts).
 */
const PUBLIC_CATALOG_REVALIDATE_SECONDS = 60;

// Không để Next render route này tĩnh lúc build (khi đó thường chưa có Backend
// => đóng băng response lỗi). Dữ liệu vẫn được cache 60s ở lời gọi fetch bên dưới.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetchBackend("/catalog/public", {
      next: { revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      return NextResponse.json({ title: "Không thể tải thực đơn." }, { status: 502 });
    }
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Public catalog: không gọi được Backend", error);
    return NextResponse.json({ title: "Không thể kết nối tới máy chủ." }, { status: 503 });
  }
}
