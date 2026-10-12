export type ErrorKind = "network" | "timeout" | "unauthorized" | "forbidden" | "not-found" | "validation" | "server" | "unknown";

export interface ApiErrorOptions {
  status: number | null;
  kind: ErrorKind;
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly kind: ErrorKind;
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

export function resolveErrorKind(status: number | null): ErrorKind {
  if (status === null) return "network";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 422 || (status >= 400 && status < 500)) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}
