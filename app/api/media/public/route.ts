import { NextResponse } from "next/server";

import { fetchBackend } from "@/lib/http/backend-fetch";

/**
 * Media công khai cho phía trình duyệt (không cần đăng nhập) — proxy tới
 * Backend GET /api/v1/media/public (chỉ media đang hoạt động). Server
 * Component gọi thẳng Backend, không qua route này (xem
 * features/media/services/public-media.service.ts).
 */
const PUBLIC_MEDIA_REVALIDATE_SECONDS = 60;

// Không để Next render route này tĩnh lúc build (khi đó thường chưa có Backend
// => đóng băng response lỗi). Dữ liệu vẫn được cache 60s ở lời gọi fetch bên dưới.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetchBackend("/media/public?pageSize=200", {
      next: { revalidate: PUBLIC_MEDIA_REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      return NextResponse.json({ title: "Không thể tải media." }, { status: 502 });
    }
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Public media: không gọi được Backend", error);
    return NextResponse.json({ title: "Không thể kết nối tới máy chủ." }, { status: 503 });
  }
}
