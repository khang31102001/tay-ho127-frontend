import { createHttpClient } from "./api-client";

/**
 * HTTP client của TRANG SITE (khách vãng lai / khách đã đăng nhập) gọi nghiệp vụ bán hàng — phương thức giao/thanh toán,
 * tùy chọn đơn, đặt hàng, phiên thanh toán, tra cứu & lịch sử đơn. Đi qua Route Handler app/api/sales/[...path]:
 * path truyền vào là path của Backend sau /api/v1/sales, vd. salesApi.get("/public/delivery-methods").
 *
 * Chỉ dùng từ Client Component (fetch tương đối). Token đăng nhập khách (nếu có) nằm trong cookie HttpOnly, Route
 * Handler tự gắn — trình duyệt không thấy token. Admin KHÔNG dùng client này (dùng adminApi).
 */
export const salesApi = createHttpClient("/api/sales");
