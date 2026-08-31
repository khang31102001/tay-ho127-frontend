export type ApiErrorKind =
  | "network"
  | "timeout"
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "server"
  | "unknown";

type ApiErrorOptions = {
  status: number | null;
  kind: ApiErrorKind;
  /** Payload lỗi gốc từ backend (nếu có) — dùng để log kỹ thuật, không hiển thị thẳng cho user. */
  details?: unknown;
};

/**
 * Lỗi chuẩn hóa cho mọi request đi qua api-client — feature/service chỉ cần
 * bắt loại lỗi này thay vì tự đoán hình dạng lỗi của từng backend khác nhau.
 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly kind: ApiErrorKind;
  readonly details?: unknown;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.kind = options.kind;
    this.details = options.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Suy ra loại lỗi từ HTTP status — dùng để chọn error kind nhất quán trong api-client. */
export function resolveErrorKind(status: number | null): ApiErrorKind {
  if (status === null) return "network";
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status >= 500) return "server";
  return "unknown";
}
