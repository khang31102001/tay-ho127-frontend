export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiQueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface ApiRequestOptions {
  params?: ApiQueryParams;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}
