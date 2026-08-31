export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiQueryParams = Record<string, string | number | boolean | undefined | null>;

export interface ApiRequestOptions {
  /** Header bổ sung — Content-Type: application/json đã có sẵn, không cần khai lại. */
  headers?: Record<string, string>;
  /** Query params — client tự build query string, không nối tay ở nơi gọi. */
  params?: ApiQueryParams;
  signal?: AbortSignal;
  /** Timeout tính bằng ms, mặc định 15s nếu không truyền. */
  timeoutMs?: number;
  /** Gửi kèm cookie (session-based auth) — mặc định "same-origin". */
  credentials?: RequestCredentials;
}

/**
 * MOCK/TEMPORARY CONTRACT — response wrapper giả định theo kiểu phổ biến ở
 * ASP.NET Core Web API (success/data/message/errors theo ModelState). Đây là
 * dự đoán hợp lý, KHÔNG phải hợp đồng đã xác nhận với Backend thật. Khi
 * Backend ASP.NET Core xác nhận contract khác, chỉ cần sửa hàm unwrap trong
 * api-client.ts — không sửa từng feature.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  /** Lỗi validate theo field, khớp ModelState.AddModelError của ASP.NET Core. */
  errors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
