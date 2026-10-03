import { NextResponse } from "next/server";

import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * Page đã xuất bản cho phía trình duyệt (không cần đăng nhập) — proxy tới Backend
 * GET /api/v1/content/public/pages. Server Component gọi thẳng Backend, không qua route này
 * (xem features/content-public/services/public-content.service.ts).
 */
const PUBLIC_PAGES_REVALIDATE_SECONDS = 60;

// Không để Next render route này tĩnh lúc build (khi đó thường chưa có Backend).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetchBackend("/content/public/pages", { next: { revalidate: PUBLIC_PAGES_REVALIDATE_SECONDS } });
    if (!response.ok) {
      return NextResponse.json({ title: "Không thể tải danh sách page." }, { status: 502 });
    }
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Public pages: không gọi được Backend", error);
    return NextResponse.json({ title: "Không thể kết nối tới máy chủ." }, { status: 503 });
  }
}
