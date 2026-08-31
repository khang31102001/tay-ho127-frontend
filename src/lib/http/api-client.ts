import { ApiError, resolveErrorKind } from "./api-error";
import type { ApiEnvelope, ApiQueryParams, ApiRequestOptions, HttpMethod } from "./api-types";

/**
 * GLOBAL HTTP CLIENT — chỉ xử lý HTTP dùng chung (base URL, header, query
 * string, timeout, parse/unwrap response, chuẩn hóa lỗi). KHÔNG chứa business
 * logic của bất kỳ domain nào (Product/Order/Customer...) — domain đó thuộc
 * về service riêng của từng feature (features/<feature>/api hoặc services).
 *
 * TEMPORARY CONTRACT: Backend ASP.NET Core Web API chưa hoàn thiện.
 * - BASE_URL rỗng ("") => request gọi tương đối trên chính origin hiện tại
 *   (dùng được cho Next.js Route Handler nội bộ dạng /api/*, chỉ nên gọi từ
 *   Client Component vì fetch tương đối không đáng tin cậy ở server runtime).
 * - Khi Backend thật sẵn sàng: set NEXT_PUBLIC_API_URL trỏ tới domain ASP.NET
 *   Core (vd. https://api.tayho127.vn). Không cần sửa gì trong client hay bất
 *   kỳ feature nào đang gọi qua `api.get/post/put/patch/delete`.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEFAULT_TIMEOUT_MS = 15_000;

function buildQueryString(params?: ApiQueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function buildUrl(path: string, params?: ApiQueryParams): string {
  return `${BASE_URL}${path}${buildQueryString(params)}`;
}

/**
 * Bóc response về đúng kiểu TResponse mà nơi gọi mong muốn.
 * MOCK/TEMPORARY CONTRACT: nếu backend trả ApiEnvelope ({ success, data, ... })
 * thì tự bóc "data"; nếu không, trả nguyên payload. Khi Backend ASP.NET Core
 * xác nhận đúng hình dạng response thật, chỉ cần sửa hàm này — không sửa
 * từng feature đang gọi api.get/post/...
 */
function unwrapPayload<TResponse>(payload: unknown): TResponse {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<TResponse>).data;
  }
  return payload as TResponse;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}

async function parseResponse<TResponse>(response: Response): Promise<TResponse> {
  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
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

async function request<TResponse>(
  method: HttpMethod,
  path: string,
  body: unknown,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), {
      method,
      headers: {
        "Content-Type": "application/json",
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

export const api = {
  get<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse> {
    return request<TResponse>("GET", path, undefined, options);
  },
  post<TResponse, TRequest = unknown>(path: string, body?: TRequest, options?: ApiRequestOptions): Promise<TResponse> {
    return request<TResponse>("POST", path, body, options);
  },
  put<TResponse, TRequest = unknown>(path: string, body?: TRequest, options?: ApiRequestOptions): Promise<TResponse> {
    return request<TResponse>("PUT", path, body, options);
  },
  patch<TResponse, TRequest = unknown>(path: string, body?: TRequest, options?: ApiRequestOptions): Promise<TResponse> {
    return request<TResponse>("PATCH", path, body, options);
  },
  delete<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse> {
    return request<TResponse>("DELETE", path, undefined, options);
  },
};
