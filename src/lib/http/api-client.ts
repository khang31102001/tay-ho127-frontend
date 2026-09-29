import { ApiError, resolveErrorKind } from "./api-error";
import type { ApiEnvelope, ApiQueryParams, ApiRequestOptions, HttpMethod } from "./api-types";

/**
 * GLOBAL HTTP CLIENT — chỉ xử lý HTTP dùng chung (base URL, header, query
 * string, timeout, parse/unwrap response, chuẩn hóa lỗi). KHÔNG chứa business
 * logic của bất kỳ domain nào (Product/Order/Customer...) — domain đó thuộc
 * về service riêng của từng feature (features/<feature>/api hoặc services).
 *
 * - `api` (client mặc định): base URL = NEXT_PUBLIC_API_URL. Rỗng ("") => gọi
 *   tương đối trên chính origin hiện tại (Route Handler nội bộ /api/*, chỉ nên
 *   gọi từ Client Component vì fetch tương đối không đáng tin cậy ở server).
 * - Admin Portal KHÔNG dùng client này để gọi Backend — dùng `adminApi`
 *   (src/lib/http/admin-api.ts) đi qua BFF Route Handler; token nằm trong
 *   cookie HttpOnly nên trình duyệt không bao giờ thấy Authorization header.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * EXTENSION POINT cho Authentication kiểu Bearer phía client — hiện chưa ai
 * gọi (Admin Portal xác thực qua cookie HttpOnly + BFF). Dành cho luồng đăng
 * nhập khách hàng của Site khi chuyển sang Backend thật.
 */
type AuthTokenProvider = () => string | null | undefined;
let authTokenProvider: AuthTokenProvider | null = null;

export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  authTokenProvider = provider;
}

function buildQueryString(params?: ApiQueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * Bóc response về đúng kiểu TResponse mà nơi gọi mong muốn: ApiEnvelope
 * ({ success, data, ... }) của Route Handler nội bộ thì bóc "data"; Backend
 * ASP.NET Core trả thẳng resource (không wrapper) nên giữ nguyên payload.
 */
function unwrapPayload<TResponse>(payload: unknown): TResponse {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiEnvelope<TResponse>).data;
  }
  return payload as TResponse;
}

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

/**
 * Lấy message lỗi hiển thị được từ payload. Hiểu 2 hình dạng:
 * - ApiEnvelope ({ message }) — Route Handler nội bộ app/api/*.
 * - ProblemDetails ({ title, detail, errors }) — Backend ASP.NET Core
 *   (GlobalExceptionHandler + ValidationActionFilter). Với lỗi validate, ưu tiên
 *   message của field đầu tiên vì "detail" chỉ là câu chung chung.
 */
function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const { message, detail, title, errors } = payload as {
    message?: unknown;
    detail?: unknown;
    title?: unknown;
    errors?: unknown;
  };

  const firstFieldError =
    errors && typeof errors === "object"
      ? Object.values(errors as Record<string, unknown>)
          .flatMap((value) => (Array.isArray(value) ? value : []))
          .find((value): value is string => typeof value === "string" && value.trim() !== "")
      : undefined;

  return firstNonEmptyString(message, firstFieldError, detail, title) ?? fallback;
}

async function parseResponse<TResponse>(response: Response): Promise<TResponse> {
  // "json" (không phải "application/json") để nhận cả "application/problem+json" của ProblemDetails.
  const isJson = response.headers.get("content-type")?.includes("json") ?? false;
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload, `Yêu cầu thất bại (${response.status}).`), {
      status: response.status,
      kind: resolveErrorKind(response.status),
      details: payload,
    });
  }

  return unwrapPayload<TResponse>(payload);
}

async function sendRequest<TResponse>(
  baseUrl: string,
  method: HttpMethod,
  path: string,
  body: unknown,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const token = authTokenProvider?.();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}${buildQueryString(options.params)}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: options.credentials ?? "same-origin",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options.signal ?? controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Yêu cầu quá thời gian chờ.", { status: null, kind: "timeout" });
    }
    throw new ApiError("Không thể kết nối tới máy chủ.", { status: null, kind: "network", details: error });
  } finally {
    clearTimeout(timeoutId);
  }

  return parseResponse<TResponse>(response);
}

export type HttpClient = {
  get<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>;
  post<TResponse, TRequest = unknown>(path: string, body?: TRequest, options?: ApiRequestOptions): Promise<TResponse>;
  put<TResponse, TRequest = unknown>(path: string, body?: TRequest, options?: ApiRequestOptions): Promise<TResponse>;
  patch<TResponse, TRequest = unknown>(path: string, body?: TRequest, options?: ApiRequestOptions): Promise<TResponse>;
  delete<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>;
};

/** Tạo HTTP client gắn với 1 base URL — dùng chung toàn bộ logic header/timeout/parse/lỗi ở trên. */
export function createHttpClient(baseUrl: string): HttpClient {
  return {
    get: (path, options) => sendRequest(baseUrl, "GET", path, undefined, options),
    post: (path, body, options) => sendRequest(baseUrl, "POST", path, body, options),
    put: (path, body, options) => sendRequest(baseUrl, "PUT", path, body, options),
    patch: (path, body, options) => sendRequest(baseUrl, "PATCH", path, body, options),
    delete: (path, options) => sendRequest(baseUrl, "DELETE", path, undefined, options),
  };
}

/** Client mặc định — base URL = NEXT_PUBLIC_API_URL (xem ghi chú đầu file). */
export const api = createHttpClient(BASE_URL);
